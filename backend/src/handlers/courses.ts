import { Router, request } from "express";

import { withAuth, authMiddleware } from "../middleware/requireAuth";
import { InternalValidationError } from "../errors/InternalValidationError";
import { ExternalValidationError } from "../errors/ExternalValidationError";
import { NotFoundError } from "../errors/NotFoundError";

import * as userService from "../services/userService";
import * as courseService from "../services/courseService";
import * as requestService from "../services/requestService";
import { REQUEST_STATUSES, ROLES, VALID_TRANSITIONS } from "../constants";
import { withSocket } from "../middleware/requireSocket";

const router = Router();
router.use(authMiddleware);

// Get registered courses endpoint.
router.get('/', withAuth(async (req, res) => {
    try { 
        // Fetch what courses the user is a member of 
        const membership = await userService.getUserMembership(req.userId);
        
        // For each course, fetch each course's metadata
        const courseIds = membership.map(x => x.courseId);
        const rawCourses = await courseService.getCoursesMetadataById(courseIds);
        
        // Add the isOpen flag to each course
        const courses = rawCourses.map((c) => ({
            role: membership.filter(x => x.courseId == c.courseId)[0].role,
            courseId: c.courseId,
            schedule: c.schedule,
            name: c.name,
        }));

        res.json({
            courses
        });
    } catch (e: unknown) {
        if (e instanceof InternalValidationError) {
            res.status(500).json({
                message: "internal database schema validation error"
            });
        } else {
            console.error(e);
            res.status(500).send();
        }
    } 
}));

// Become a member of this course endpoint
router.post('/:courseId/join', withAuth(async (req, res) => {
    try {
        const role = req.query.role;
        if (role !== "STUDENT" && role !== "HELPER") {
            res.status(400).send();
            return;
        }
       
        const course = await courseService.getCourseMetadataById(req.params.courseId);
        if (!course) {
            res.status(404).send();
            return;
        }
        
        await userService.joinUserToCourse(req.userId, req.params.courseId, role);
        res.status(200).send({
            course: {
                role,
                courseId: course.courseId,
                schedule: course.schedule,
                name: course.name,
            }
        });
    } catch (e: unknown) {
        console.error(e);
        res.status(500).send();
    }
}));

// Get course metadata by ID endpoint
router.get('/:courseId/', withAuth(async (req, res) => {
    try {
        const course = await courseService.getCourseMetadataById(req.params.courseId);
        if (!course) {
            res.status(404).send();
            return;
        }

        res.status(200).send(course);
    } catch (e: unknown) {
        console.error(e);
        res.status(500).send();
    }
}));

// Create or edit request by ID endpoint
router.put('/:courseId/requests/:requestId', withAuth(async (req, res) => {
    try {
        const unvalidated = {
            ...req.body,
            courseId: req.params.courseId,
            requestId: req.params.requestId,
            creatorId: req.userId,
        };

        const validated = requestService.validateStudentRequest(unvalidated);
        await requestService.putStudentRequest(validated);

        res.status(200).send();
    } catch (e: unknown) {
        if (e instanceof ExternalValidationError) {
            res.status(400).send({
                message: e.message
            });
            return;
        } else {
            console.error(e);
            res.status(500).send();
        }
    }
}));

// Get request by ID endpoint
router.get('/:courseId/requests/:requestId', withAuth(async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const requestId = req.params.requestId;
        
        const [requestItem, userRole, statuses] = await Promise.all([
            requestService.getRequestById(courseId, requestId),
            userService.getUserMembershipForCourse(req.userId, courseId),
            courseService.getRequestStatuses(courseId)
        ]);

        if (!requestItem) {
            // We couldn't find the request
            res.status(404).send();
        } else if (!userRole) {
            // The user isn't a member of this course
            res.status(403).send();
        } else if (requestItem.creatorId !== req.userId && userRole === ROLES.STUDENT) {
            // The user didn't create this request and isn't a helper/admin
            res.status(403).send()
        } else {
            res.status(200).send({...requestItem, status: statuses[requestId] ?? REQUEST_STATUSES.CLOSED});
        }

    } catch (e: unknown) {
        console.error(e);

        if (e instanceof InternalValidationError) {
            res.status(500).send({
                message: "internal database schema validation error"
            });
            return;
        }

        res.status(500).send();
    }
}));

// Get personal request history endpoint
router.get('/:courseId/history', withAuth(async (req, res) => {
    try {
        const courseId = req.params.courseId;
       
        const requests = await requestService.getAllRequestsForUser(req.userId, courseId);

        const formattedRequests = requests.map(r => ({
            requestId: r.requestId,
            assignment: r.assignment,
            problem: r.problem,
            shortDescription: r.shortDescription,
            resolution: r.resolution,
            comments: r.comments,
            createdAt: r.createdAt,
            helperId: r.helperId,
            helperName: r.helperName,
        }));

        res.status(200).send({requests: formattedRequests});
    } catch (e: unknown) {
        console.error(e);

        if (e instanceof InternalValidationError) {
            res.status(500).send({
                message: "internal database schema validation error"
            });
            return;
        }

        res.status(500).send();
    }
}));

// Update request status endpoint
router.post('/:courseId/requests/:requestId/status', withSocket(async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const requestId = req.params.requestId;

        const [requestItem, userRole, statuses] = await Promise.all([
            requestService.getRequestById(courseId, requestId),
            userService.getUserMembershipForCourse(req.userId, courseId),
            courseService.getRequestStatuses(courseId),
        ]);

        if (!requestItem) {
            // We couldn't find the request
            res.status(404).send();
            return;
        } 
        
        if (!userRole) {
            // The user isn't a member of this course
            res.status(403).send();
            return;
        } 
        
        // Validate the status update body
        const currentStatus = statuses[requestId] ?? "CREATED";
        const nextStatus = requestService.validateStatusUpdate(req.body);
        if (!nextStatus) {
            res.status(400).send();
            return;
        }

        // Validate it is possible for the user to make this transition
        if (!(userRole in VALID_TRANSITIONS)  ||
            !(currentStatus in VALID_TRANSITIONS[userRole]) ||
            !VALID_TRANSITIONS[userRole][currentStatus].includes(nextStatus)) {
            res.status(403).send();
            return;
        }

        // Update backend and dispatch events
        const newStatuses = await courseService.updateRequestStatus(courseId, requestId, nextStatus);
        req.io.to(courseId).emit("statusUpdate", newStatuses);
        switch(nextStatus) {
            case REQUEST_STATUSES.PENDING: {
                const newOrder = await courseService.addRequestToOrder(courseId, requestId);
                req.io.to(req.userId).emit("activeRequest", requestId);
                req.io.to(courseId).emit("orderUpdate", newOrder);
                break;
            };
            case REQUEST_STATUSES.CLOSED: {
                if (req.userId !== requestItem.creatorId) await requestService.partialRequestUpdate(courseId, requestId, { helperId: req.userId, helperName: req.username });
                const newOrder = await courseService.removeRequestFromOrder(courseId, requestId);
                req.io.to(requestItem.creatorId).emit("activeRequest", "");
                req.io.to(courseId).emit("orderUpdate", newOrder);
                break;
            }
            case REQUEST_STATUSES.SERVING: {
                await requestService.partialRequestUpdate(courseId, requestId, { helperId: req.userId, helperName: req.username });
                const newOrder = await courseService.removeRequestFromOrder(courseId, requestId);
                req.io.to(courseId).emit("orderUpdate", newOrder);
                break;
            };
            case REQUEST_STATUSES.LEFT:
                const newOrder = await courseService.removeRequestFromOrder(courseId, requestId);
                req.io.to(courseId).emit("orderUpdate", newOrder);
                break;
            case REQUEST_STATUSES.NEEDS_UPDATE:
            case REQUEST_STATUSES.UPDATED:
            case REQUEST_STATUSES.RESOLVED:
                break;
        }

        res.status(200).send();
    } catch (e: unknown) {
        console.error(e);

        if (e instanceof InternalValidationError) {
            res.status(500).send({
                message: "internal database schema validation error"
            });
            return
        }

        res.status(500).send();
    }
}));

router.post("/:courseId/requests/next", withSocket(async (req, res) => {
    try {
        const courseId = req.params.courseId;
        console.log(courseId);
        const [order, userRole, statuses] = await Promise.all([
            courseService.getCourseQueueOrder(courseId),
            userService.getUserMembershipForCourse(req.userId, courseId),
            courseService.getRequestStatuses(courseId),
        ]);

        if (!order) {
            // We couldn't find the request
            res.status(404).send();
            return;
        } 
        
        if (!userRole || userRole == ROLES.STUDENT) {
            // The user isn't a helper in this course
            res.status(403).send();
            return;
        } 

        const eligibleRequests = order.order.filter(id => statuses[id] === REQUEST_STATUSES.PENDING || statuses[id] === REQUEST_STATUSES.UPDATED);
        if (eligibleRequests.length < 1) {
            // No requests to be able to service anymore
            res.status(400).send();
        } 

        const requestId = eligibleRequests[0];
        const nextStatus = REQUEST_STATUSES.IN_REVIEW;
        const newStatuses = await courseService.updateRequestStatus(courseId, requestId, nextStatus);
        req.io.to(courseId).emit("statusUpdate", newStatuses);

        res.status(200).send({ requestId });
    } catch (e: unknown) {
        console.error(e);

        if (e instanceof InternalValidationError) {
            res.status(500).send({
                message: "internal database schema validation error"
            });
            return
        }

        res.status(500).send();
    }
}));


router.post("/:courseId/requests/:requestId/comment", withSocket(async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const requestId = req.params.requestId;
        
        const comment = req.body.comment as unknown;
        if (typeof comment !== "string") {
            res.status(400).send();
            return;
        }

        await requestService.addCommentToRequest(courseId, requestId, comment);
        
        res.status(201).send();
    } catch (e: unknown) {
        if (e instanceof NotFoundError) { // couldn't find the request
            res.status(404).send();
            return;
        }

        console.error(e);
        res.status(500).send();
    }
}));

router.patch("/:courseId/requests/:requestId", withSocket(async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const requestId = req.params.requestId;

        const body = requestService.validatePartialStudentRequest(req.body);
        await requestService.partialRequestUpdate(courseId, requestId, body)
        
        res.status(200).send();
    } catch (e: unknown) {
        if (e instanceof NotFoundError) { // couldn't find the request
            res.status(404).send();
            return;
        }

        if (e instanceof ExternalValidationError) { // failed validation
            res.status(400).send();
            return; 
        }

        console.error(e);
        res.status(500).send();
    }
}));

export default router;

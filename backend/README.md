# API Specification
## Table of Contents
 - GET `/ping` - Status check
 - GET `/courses` - Get registered courses
 - GET `/courses/[courseId]/` - Get course metadata by ID
 - GET `/courses/[courseId]/history` - Get per-user request history
 - POST `/courses/[courseId]/join` - Become a member of a course
 - GET `/courses/[courseId]/queue` - Get active requests in quejue
 - GET `/courses/[courseId]/requests/[requestId]`- Get request by ID
 - PUT `/courses/[courseId]/requests/[requestId]`- Create or edit a request by ID
 - POST `/courses/[courseId]/requests/[requestId]/action`- Change request status 

## GET `/ping` - Status Check
### Request
n/a

### 200 OK Response
Returns the text `pong` if the server is alive.
Does not require authentication.

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|


**Response**
```
pong
```

***

## GET `/courses` - Course List
### Request

**Headers**
|Header|Value|Description|
|-|-|-|
|Authorization| `Bearer <accessToken>`|Include the `accessToken` returned from the `useTokenEffect` hook|

### 200 OK Response
**Status Code:** 200 

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `application/json`|

**Body**
|Property|Type|Description|
|-|-|-|
|`courses`|`Course[]`|A list of the logged in user's queues, including metadata - enough to populate the Dashboard view|
|`courses[i].name`|`string`|The course name|
|`courses[i].schedule`|`Occurence[]`|List of days and times the queue will accept requests|
|`courses[i].schedule[j].dayOfWeek`|`string`|The day this occurrence item is for
|`courses[i].schedule[j].opensAt`|`Time`|The time at which the queue will open on this schedule day|
|`courses[i].schedule[j].closesAt`|`Time`|The time at which the queue will close on this schedule day|

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

***

## GET `/courses/[courseId]/` - Get course metadata
Retrieves the metadata (schedule information, resource links) for the specified course

### Request Structure
**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course to retrieve metadata for.|

### 200 OK Response

**Status Code:** 200

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `application/json`|

**Body:**
|Property|Type|Description|
|--------|----|-----------|
|`name`|`string`|The course name|
|`schedule`|`Occurence[]`|List of days and times the queue will accept requests|
|`schedule[j].dayOfWeek`|`string`|The day this occurrence item is for
|`schedule[j].opensAt`|`Time`|The time at which the queue will open on this schedule day|
|`schedule[j].closesAt`|`Time`|The time at which the queue will close on this schedule day|
|`location`|`string`|Physical location where the queue helpers will accept requests|
|`resources`|`Link[]`|List of queue resources provided by administrators|
|`resources[j].text`|`string`|Resource `j`'s friendly name (e.g., "OH Calendar")|
|`resources[j].url`|`string`|URL for resource `j`|

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

## GET `/courses/[courseId]/history` - Request History
Retrieves a list of the logged-in user's previous requests in this course. 

### Request Structures

**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course to retrieve the request history for.|

**Request Headers:**
|Header|Value|Description|
|-|-|-|
|Authorization| `Bearer <accessToken>`|Include the `accessToken` returned from the `useTokenEffect` hook|

### 200 OK Response

**Status Code:** 200 OK

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `application/json`|

**Body**
|Property|Type|Description|
|--------|----|-----------|
|`requests`|`RequestSummary[]`|A list of the logged in user's requests for this `courseId`|
|`requests[i].requestId`|`ID`|The globally unique ID associated with this request|
|`requests[i].assignment`|`string`|The overall assignment this request is associated with|
|`requests[i].problem`|`string`|The problem (within the assignment) this request is associated with|
|`requests[i].shortDescription`|`string`|The students one-to-two sentence description of what they needed help with|
|`requests[i].resolution`|`string`|The student's reflection on how the problem was solved (or not solved)|
|`requests[i].comments`|`Comment[]`|A (possible empty) list of the student's comments on this request|
|`requests[i].comments[j].createdAt`|`Date`|Date and time the comment was added to the request|
|`requests[i].comments[j].text`|`string`|The text content of the comment|
|`requests[i].isActive`|`boolean`|True if this request is currently registered in the queue|

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 403 Forbidden
Returned if the logged-in user does not have the `student` role inside this course.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

## POST `/courses/[courseId]/join` - Become a member of this queue
Joins the signed-in user to the queue

### Request Structures

**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course to join.|

**Request Headers:**
|Header|Value|Description|
|-|-|-|
|Authorization| `Bearer <accessToken>`|Include the `accessToken` returned from the `useTokenEffect` hook|
|Content-Type|`application/json`|Provide request data as JSON.|


**Request Body:**
|Property|Type|Description|
|-|-|-|
|`role`|`ROLE`|Exactly one of `"STUDENT"` or `"HELPER"`|

### 200 OK Response

**Status Code:** 200 OK

**Headers**
|Header|Value|
|-----|------|
|Content-Type|`text/plain`|

**Body**
```
<empty>
```

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

## GET `/courses/[courseId]/queue` - Get all requests in the queue
Retrieves the queue ordering for the provided course, with enough metadata to populate the staff home page

### Request Structure
**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course to retrieve the queue ordering for.|

### 200 OK Response

**Status Code:** 200

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `application/json`|

**Body:**
|Property|Type|Description|
|--------|----|-----------|
|`order`|`RequestInQueue[]`|a list of all requests during the time the queue has been open|
|`order[i].requestId`|`ID`|the globally unique ID for this request|
|`order[i].status`|`REQUEST_STATUS`|Exactly one of `"CREATED"`, `"PENDING"`, `"POSTPONED"`, `"SERVING"`, `"CLOSED"`|
|`order[i].createdAt`|`DateTime`|The time at which the request was created|
|`order[i].updatedAt`|`DateTime`|The time at which this request was last updated.|
|`order[i].creatorId`|`ID`|The requestor's user ID|
|`order[i].creatorName`|`string`|The requestor's friendly name (e.g., `Daniel (djchao)`)|
|`order[i].helperId`|`ID`|The user ID of the staff member who served this request|
|`order[i].helperName`|`string`|The human-readable name of the staff member who served this request|
|`order[i].assignment`|`string`|Assignment associated with this request|
|`order[i].problem`|`string`|Problem assigned with this request|
|`order[i].questionType`|`QUESTION_TYPE`|Exactly one of `"DEBUGGING"` or `"CONCEPTUAL"`|

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 403 Forbidden Response
Returned if the logged-in user does not have the `helper` or `admin` role
inside this course.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

## GET `/courses/[courseId]/requests/[requestId]`- Get request by ID
Retrieves the details of the request specified by the id `requestId` inside the
course specified by `courseId`

### Request Structure

**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course to retrieve the request details for.|
|`requestId`| The ID of the request to retrieve the request details for.|

**Request Headers:**
|Header|Value|Description|
|-|-|-|
|Authorization| `Bearer <accessToken>`|Include the `accessToken` returned from the `useTokenEffect` hook|


### 200 OK Response

**Status Code:** 200

**Headers:**
|Header|Value|
|------|------------|
|Content-Type| `application/json`|

**Body:**
|Property|Type|Description|
|-|-|-|
|`requestId`|`ID`|The request's globally unique ID|
|`status`|`REQUEST_STATUS`|Exactly one of `"PENDING"`, `"POSTPONED"`, `"SERVING"`, `"CLOSED"`|
|`creatorId`|`ID`|The requestor's user ID|
|`creatorName`|`string`|The requestor's friendly name (e.g., `Daniel (djchao)`)|
|`updatedAt`|`DateTime`|The time at which this request was last updated.|
|`createdAt`|`DateTime`|The time at which this request was added to the queue.|
|`location`|`string`|Where the helper will find student|
|`assignment`|`string`|Assignment associated with this request|
|`problem`|`string`|Problem assigned with this request|
|`questionType`|`QUESTION_TYPE`|Exactly one of `"DEBUGGING"` or `"CONCEPTUAL"`|
|`shortDescription`|`string`|One sentence description for what is going the student wants help with|
|`alreadyTried`|`string[]`|A list of strings (from checkboxes or otherwise) about what the student has already tried|
|`bestGuess`|`string`|What the student thinks the problem might be|
|`helperId`|`string`|The user ID of the staff member who served this request|
|`helperName`|`string`|The human-readable name of the staff member who served this request|
|`howToHelp`|`string`|How the student wants the helper to help|
|`stuckTime`|`string`|How long the student has been stuck|
|`comments`|`Comment[]`|A (possible empty) list of the student's comments on this request|
|`comments[j].createdAt`|`Date`|Date and time the comment was added to the request|
|`comments[j].text`|`string`|The text content of the comment|

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found, the `requestId` could not be found, or the `requestId` is not a current/former request of `courseId`.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 403 Forbidden Response
Returned if the logged-in user does not have the `helper` or `admin` role
inside this course, or if the logged-in user is of type `student` and did not 
create this request.


**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

## PUT `/courses/[courseId]/requests/[requestId]` - Create or edit request by ID
Creates the request if `courseId` doesn't exist, or replaces the request contents with the request body if it it doesn. Provide a complete request instead of a partial one: all fields will be replaced.

Importantly, this request does not add a request to the queue. See 
"Change Request Status" for how to join a request to the queue.

### Request Structures

**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course that contains this request.|
|`requestId`| The ID of the request. To generate, use the [ULID](https://www.npmjs.com/package/ulid) library.|

**Request Headers:**
|Header|Value|Description|
|-|-|-|
|Authorization| `Bearer <accessToken>`|Include the `accessToken` returned from the `useTokenEffect` hook|
|Content-Type|`application/json`|Provide request data as JSON.|

**Request Body:**
|Property|Type|Description|
|-|-|-|
|`location`|`string`|Where the helper will find student|
|`assignment`|`string`|Assignment associated with this request|
|`problem`|`string`|Problem assigned with this request|
|`questionType`|`QUESTION_TYPE`|Exactly one of `"debugging"` or `"conceptual"`|
|`shortDescription`|`string`|One sentence description for what is going the student wants help with|
|`alreadyTried`|`string[]`|A list of strings (from checkboxes or otherwise) about what the student has already tried|
|`bestGuess`|`string`|What the student thinks the problem might be|
|`howToHelp`|`string`|How the student wants the helper to help|
|`stuckTime`|`string`|How long the student has been stuck|

### 201 OK Response
Returned if the request was newly created.

**Status Code**: 200 OK

**Response Headers:**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 200 OK Response
Returned if the request was updated. 

**Status Code**: 200 OK

**Response Headers:**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 401 Unauthorized Response
**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found, the `requestId` could not be found, or the `requestId` is not a current/former request of `courseId`.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 403 Forbidden Response
Returned if the logged-in user does not have the `helper` or `admin` role
inside this course, or if the logged-in user is of type `student` and did not 
create this request.


**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

## POST `/courses/[courseId]/requests/[requestId]/action` - Update request status 
Update the request's status by accepting/postponing/declining a request. Not
idempotent. Has side effects: will trigger notifications to subscribed clients.

### Request Structure
**URL Parameters:**
|Name|Value|
|----|-----|
|`courseId`| The ID of the course that contains this request.|
|`requestId`| The ID of the request.|

**Request Headers:**
|Header|Value|Description|
|-|-|-|
|Authorization| `Bearer <accessToken>`|Include the `accessToken` returned from the `useTokenEffect` hook|
|Content-Type|`application/json`|Provide request data as JSON.|

**Request Body:**
|Property|Type|Description|
|-|-|-|
|`newStatus`|`REQUEST_STATUS` |Exactly one of `"POSTPONED"`,`"PENDING"`, `"SERVING"`, `"CLOSED"`|

### 200 OK Response
Returned if the update succeeded. 

**Status Code**: 200 OK

**Response Headers:**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 401 Unauthorized Response
Returned if the user is unauthenticated.

**Status Code:** 401

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

When receiving this response. The app should redirect to `cutequeue.com/`

### 404 Not Found Response
Returned if the `courseId` if the course ID could not be found, the `requestId` could not be found, or the `requestId` is not a current/former request of `courseId`.

**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```

### 403 Forbidden Response
Returned if the logged-in user does not have the `helper` or `admin` role
inside this course, or if the `newStatus` was anything except `CLOSED` and the
logged-in user is of type `student`. 

Only `helper` and `admin` roles can transition requests to `POSTPONED` or
`SERVING`.


**Status Code:** 404 Not Found

**Headers**
|Header|Value|
|------|------------|
|Content-Type| `text/plain`|

**Body**
```
<empty>
```
import { DependencyList, EffectCallback, useEffect } from "react";

import { useAuth } from "@/contexts/authContext";

export type TokenEffectCallback = (token: string) => ReturnType<EffectCallback>;

export default function useTokenEffect(effect: TokenEffectCallback, deps: DependencyList) {
    const auth = useAuth();

    useEffect(() => {
        let abort = false;

        if (!auth.ready) return;

        const getToken = async () => {
            if(!abort) {
                const token = await auth.getToken();
                effect(token)?.(); // run the effect's destructor if provided
            }
        }

        getToken();

        return () => {
            abort = true;
        }
    }, [...deps, auth.ready]);
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AiLimoContext = createContext(null);

export function AiLimoProvider({ children }) {
  const [pageContext, setPageContext] = useState(null);
  const value = useMemo(() => ({ pageContext, setPageContext }), [pageContext]);
  return <AiLimoContext.Provider value={value}>{children}</AiLimoContext.Provider>;
}

export function useAiLimo() {
  const value = useContext(AiLimoContext);
  if (!value) throw new Error("useAiLimo must be used inside AiLimoProvider");
  return value;
}

export function useAiLimoPageContext(context) {
  const { setPageContext } = useAiLimo();
  const serialized = JSON.stringify(context ?? null);

  useEffect(() => {
    setPageContext(context ?? null);
    return () => setPageContext(null);
    // The serialized value intentionally provides stable, value-based updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, setPageContext]);
}

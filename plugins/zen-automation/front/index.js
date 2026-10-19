// plugins/zen-automation/src/front/components/LogViewer.tsx
import { useLayoutEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jsx, jsxs } from "react/jsx-runtime";
var STICK_THRESHOLD_PX = 32;
function LogViewer({ logs }) {
  const containerRef = useRef(null);
  const stickToBottom = useRef(true);
  const handleScroll = () => {
    const element = containerRef.current;
    if (element === null) return;
    stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < STICK_THRESHOLD_PX;
  };
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (element !== null && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [logs]);
  return /* @__PURE__ */ jsxs(Card, { className: "min-w-0", children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "\u30ED\u30B0" }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
      "pre",
      {
        ref: containerRef,
        onScroll: handleScroll,
        className: "h-[60vh] min-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed",
        children: logs.length > 0 ? logs.join("\n") : "\u30ED\u30B0\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093"
      }
    ) })
  ] });
}

// plugins/zen-automation/src/front/components/RunForm.tsx
import { useState } from "react";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card as Card2, CardContent as CardContent2, CardFooter, CardHeader as CardHeader2, CardTitle as CardTitle2 } from "@/components/ui/card";

// plugins/zen-automation/src/front/components/MonthSelect.tsx
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ALL_MONTHS = "all";
var MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1));
function MonthSelect({ value, disabled, onValueChange }) {
  return /* @__PURE__ */ jsxs2("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx2(Label, { htmlFor: "zen-month", children: "\u5BFE\u8C61\u306E\u6708" }),
    /* @__PURE__ */ jsxs2(Select, { value, onValueChange, disabled, children: [
      /* @__PURE__ */ jsx2(SelectTrigger, { id: "zen-month", className: "w-full sm:w-48", children: /* @__PURE__ */ jsx2(SelectValue, {}) }),
      /* @__PURE__ */ jsxs2(SelectContent, { children: [
        /* @__PURE__ */ jsx2(SelectItem, { value: ALL_MONTHS, children: "\u6307\u5B9A\u306A\u3057(\u3059\u3079\u3066)" }),
        MONTHS.map((month) => /* @__PURE__ */ jsxs2(SelectItem, { value: month, children: [
          month,
          "\u6708"
        ] }, month))
      ] })
    ] })
  ] });
}

// plugins/zen-automation/src/front/components/OptionSwitch.tsx
import { Label as Label2 } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function OptionSwitch({ id, label, description, checked, disabled, onCheckedChange }) {
  return /* @__PURE__ */ jsxs3("div", { className: "flex items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxs3("div", { className: "flex min-w-0 flex-col gap-1", children: [
      /* @__PURE__ */ jsx3(Label2, { htmlFor: id, children: label }),
      /* @__PURE__ */ jsx3("p", { className: "text-sm text-muted-foreground", children: description })
    ] }),
    /* @__PURE__ */ jsx3(Switch, { id, checked, disabled, onCheckedChange })
  ] });
}

// plugins/zen-automation/src/front/components/TaskSelect.tsx
import { Label as Label3 } from "@/components/ui/label";
import { Select as Select2, SelectContent as SelectContent2, SelectItem as SelectItem2, SelectTrigger as SelectTrigger2, SelectValue as SelectValue2 } from "@/components/ui/select";

// plugins/zen-automation/src/front/format.ts
var TASK_LABELS = {
  reports: "\u30EC\u30DD\u30FC\u30C8\u8996\u8074",
  login: "\u30ED\u30B0\u30A4\u30F3"
};
var formatDateTime = (epochMs) => new Date(epochMs).toLocaleString("ja-JP");
var formatDuration = (fromMs, toMs) => {
  const totalSeconds = Math.max(0, Math.floor((toMs - fromMs) / 1e3));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}\u6642\u9593${minutes}\u5206`;
  if (minutes > 0) return `${minutes}\u5206${seconds}\u79D2`;
  return `${seconds}\u79D2`;
};
var getRunOutcome = (run) => {
  if (run.finishedAt === null) return "running";
  if (run.stopped) return "stopped";
  return run.exitCode === 0 ? "completed" : "failed";
};

// plugins/zen-automation/src/front/components/TaskSelect.tsx
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var TASKS = ["reports", "login"];
function TaskSelect({ value, disabled, onValueChange }) {
  return /* @__PURE__ */ jsxs4("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx4(Label3, { htmlFor: "zen-task", children: "\u51E6\u7406" }),
    /* @__PURE__ */ jsxs4(Select2, { value, onValueChange: (next) => onValueChange(next), disabled, children: [
      /* @__PURE__ */ jsx4(SelectTrigger2, { id: "zen-task", className: "w-full sm:w-48", children: /* @__PURE__ */ jsx4(SelectValue2, {}) }),
      /* @__PURE__ */ jsx4(SelectContent2, { children: TASKS.map((task) => /* @__PURE__ */ jsx4(SelectItem2, { value: task, children: TASK_LABELS[task] }, task)) })
    ] })
  ] });
}

// plugins/zen-automation/src/front/components/RunForm.tsx
import { Fragment, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function RunForm({ running, busy, configured, onRun, onStop }) {
  const [task, setTask] = useState("reports");
  const [dryRun, setDryRun] = useState(false);
  const [headless, setHeadless] = useState(false);
  const [month, setMonth] = useState(ALL_MONTHS);
  const [force, setForce] = useState(false);
  const [manualGoogle, setManualGoogle] = useState(false);
  const locked = running || busy;
  const handleRun = () => {
    if (task === "login") {
      onRun({ task, headless, force, manualGoogle });
      return;
    }
    onRun({ task, dryRun, headless, month: month === ALL_MONTHS ? null : Number(month) });
  };
  return /* @__PURE__ */ jsxs5(Card2, { children: [
    /* @__PURE__ */ jsx5(CardHeader2, { children: /* @__PURE__ */ jsx5(CardTitle2, { children: "\u5B9F\u884C" }) }),
    /* @__PURE__ */ jsxs5(CardContent2, { className: "flex flex-col gap-5", children: [
      /* @__PURE__ */ jsx5(TaskSelect, { value: task, disabled: locked, onValueChange: setTask }),
      task === "reports" ? /* @__PURE__ */ jsxs5(Fragment, { children: [
        /* @__PURE__ */ jsx5(MonthSelect, { value: month, disabled: locked, onValueChange: setMonth }),
        /* @__PURE__ */ jsx5(
          OptionSwitch,
          {
            id: "zen-dry-run",
            label: "\u30C9\u30E9\u30A4\u30E9\u30F3",
            description: "\u5BFE\u8C61\u306E\u6708\u30FB\u6559\u79D1\u3092\u8868\u793A\u3059\u308B\u3060\u3051\u3067\u3001\u52D5\u753B\u306F\u518D\u751F\u3057\u307E\u305B\u3093",
            checked: dryRun,
            disabled: locked,
            onCheckedChange: setDryRun
          }
        )
      ] }) : /* @__PURE__ */ jsxs5(Fragment, { children: [
        /* @__PURE__ */ jsx5(
          OptionSwitch,
          {
            id: "zen-force",
            label: "\u518D\u30ED\u30B0\u30A4\u30F3",
            description: "\u4FDD\u5B58\u6E08\u307F\u306E\u30BB\u30C3\u30B7\u30E7\u30F3\u304C\u3042\u3063\u3066\u3082\u3001\u3082\u3046\u4E00\u5EA6\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059",
            checked: force,
            disabled: locked,
            onCheckedChange: setForce
          }
        ),
        /* @__PURE__ */ jsx5(
          OptionSwitch,
          {
            id: "zen-manual-google",
            label: "Google \u306B\u624B\u52D5\u3067\u30ED\u30B0\u30A4\u30F3",
            description: "\u30E1\u30FC\u30EB\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u81EA\u52D5\u5165\u529B\u305B\u305A\u3001\u30CE\u30FC\u30C9\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u624B\u52D5\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059",
            checked: manualGoogle,
            disabled: locked,
            onCheckedChange: setManualGoogle
          }
        )
      ] }),
      /* @__PURE__ */ jsx5(
        OptionSwitch,
        {
          id: "zen-headless",
          label: "\u30D8\u30C3\u30C9\u30EC\u30B9",
          description: "\u30D6\u30E9\u30A6\u30B6\u3092\u8868\u793A\u305B\u305A\u306B\u5B9F\u884C\u3057\u307E\u3059\u3002\u52D5\u753B\u8996\u8074\u3084\u521D\u56DE\u30ED\u30B0\u30A4\u30F3\u306B\u306F\u5411\u304D\u307E\u305B\u3093",
          checked: headless,
          disabled: locked,
          onCheckedChange: setHeadless
        }
      )
    ] }),
    /* @__PURE__ */ jsxs5(CardFooter, { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs5(Button, { onClick: handleRun, disabled: locked || !configured, children: [
        /* @__PURE__ */ jsx5(Play, {}),
        "\u5B9F\u884C"
      ] }),
      /* @__PURE__ */ jsxs5(Button, { variant: "destructive", onClick: onStop, disabled: !running || busy, children: [
        /* @__PURE__ */ jsx5(Square, {}),
        "\u505C\u6B62"
      ] })
    ] })
  ] });
}

// plugins/zen-automation/src/front/components/StatusCard.tsx
import { Card as Card3, CardContent as CardContent3, CardHeader as CardHeader3, CardTitle as CardTitle3 } from "@/components/ui/card";

// plugins/zen-automation/src/front/components/RunStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { jsx as jsx6 } from "react/jsx-runtime";
function RunStatusBadge({ outcome }) {
  switch (outcome) {
    case "running":
      return /* @__PURE__ */ jsx6(Badge, { children: "\u5B9F\u884C\u4E2D" });
    case "completed":
      return /* @__PURE__ */ jsx6(Badge, { variant: "secondary", children: "\u5B8C\u4E86" });
    case "failed":
      return /* @__PURE__ */ jsx6(Badge, { variant: "destructive", children: "\u5931\u6557" });
    case "stopped":
      return /* @__PURE__ */ jsx6(Badge, { variant: "outline", children: "\u505C\u6B62\u6E08\u307F" });
    default:
      return /* @__PURE__ */ jsx6(Badge, { variant: "outline", children: "\u672A\u5B9F\u884C" });
  }
}

// plugins/zen-automation/src/front/components/StatusCard.tsx
import { Fragment as Fragment2, jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function Detail({ label, children }) {
  return /* @__PURE__ */ jsxs6("div", { className: "flex flex-col gap-0.5 sm:flex-row sm:gap-4", children: [
    /* @__PURE__ */ jsx7("dt", { className: "w-20 shrink-0 text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx7("dd", { className: "min-w-0 break-all", children })
  ] });
}
function StatusCard({ status }) {
  const { run } = status;
  const outcome = run ? getRunOutcome(run) : null;
  return /* @__PURE__ */ jsxs6(Card3, { children: [
    /* @__PURE__ */ jsx7(CardHeader3, { children: /* @__PURE__ */ jsxs6(CardTitle3, { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx7("span", { children: "\u72B6\u614B" }),
      /* @__PURE__ */ jsx7(RunStatusBadge, { outcome })
    ] }) }),
    /* @__PURE__ */ jsxs6(CardContent3, { className: "flex flex-col gap-3 text-sm", children: [
      status.configError && /* @__PURE__ */ jsxs6("p", { role: "alert", className: "break-words text-destructive", children: [
        status.configError,
        "\u3002\u30D7\u30E9\u30B0\u30A4\u30F3\u306E\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      ] }),
      run ? /* @__PURE__ */ jsxs6("dl", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx7(Detail, { label: "\u51E6\u7406", children: TASK_LABELS[run.task] }),
        /* @__PURE__ */ jsx7(Detail, { label: "\u30B3\u30DE\u30F3\u30C9", children: run.args.join(" ") }),
        /* @__PURE__ */ jsx7(Detail, { label: "\u958B\u59CB", children: formatDateTime(run.startedAt) }),
        run.finishedAt !== null && /* @__PURE__ */ jsxs6(Fragment2, { children: [
          /* @__PURE__ */ jsx7(Detail, { label: "\u7D42\u4E86", children: formatDateTime(run.finishedAt) }),
          /* @__PURE__ */ jsx7(Detail, { label: "\u6240\u8981\u6642\u9593", children: formatDuration(run.startedAt, run.finishedAt) }),
          !run.stopped && /* @__PURE__ */ jsx7(Detail, { label: "\u7D42\u4E86\u30B3\u30FC\u30C9", children: String(run.exitCode ?? run.signal ?? "-") })
        ] })
      ] }) : /* @__PURE__ */ jsx7("p", { className: "text-muted-foreground", children: "\u307E\u3060\u5B9F\u884C\u3055\u308C\u3066\u3044\u307E\u305B\u3093" })
    ] })
  ] });
}

// plugins/zen-automation/src/front/components/ZenSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { jsx as jsx8, jsxs as jsxs7 } from "react/jsx-runtime";
function ZenSkeleton() {
  return /* @__PURE__ */ jsxs7("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]", children: [
    /* @__PURE__ */ jsxs7("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsx8(Skeleton, { className: "h-40 w-full" }),
      /* @__PURE__ */ jsx8(Skeleton, { className: "h-72 w-full" })
    ] }),
    /* @__PURE__ */ jsx8(Skeleton, { className: "h-96 w-full" })
  ] });
}

// plugins/zen-automation/src/front/useZenStatus.ts
import { useCallback, useEffect, useMemo, useState as useState2 } from "react";

// plugins/zen-automation/src/front/api.ts
var createZenApi = (host) => ({
  getStatus: () => host.api.request("/status"),
  run: (request) => host.api.request("/run", { method: "POST", body: request }),
  stop: () => host.api.request("/stop", { method: "POST", body: {} })
});

// plugins/zen-automation/src/front/useZenStatus.ts
var POLL_INTERVAL_MS = 2e3;
var describeError = (error) => error instanceof Error ? error.message : String(error);
function useZenStatus(host) {
  const api = useMemo(() => createZenApi(host), [host]);
  const [status, setStatus] = useState2(null);
  const [pollError, setPollError] = useState2(null);
  const [actionError, setActionError] = useState2(null);
  const [busy, setBusy] = useState2(false);
  useEffect(() => {
    let cancelled = false;
    let timer;
    const tick = async () => {
      try {
        const next = await api.getStatus();
        if (!cancelled) {
          setStatus(next);
          setPollError(null);
        }
      } catch (caught) {
        if (!cancelled) setPollError(describeError(caught));
      }
      if (!cancelled) timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
    };
    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [api]);
  const perform = useCallback(async (action) => {
    setBusy(true);
    setActionError(null);
    try {
      setStatus(await action());
    } catch (caught) {
      setActionError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }, []);
  const run = useCallback((request) => perform(() => api.run(request)), [api, perform]);
  const stop = useCallback(() => perform(() => api.stop()), [api, perform]);
  return { status, pollError, actionError, busy, run, stop };
}

// plugins/zen-automation/src/front/ZenAutomationPage.tsx
import { jsx as jsx9, jsxs as jsxs8 } from "react/jsx-runtime";
function ErrorMessage({ message }) {
  return /* @__PURE__ */ jsx9("p", { role: "alert", className: "break-words text-sm text-destructive", children: message });
}
function ZenAutomationPage({ host }) {
  const { status, pollError, actionError, busy, run, stop } = useZenStatus(host);
  if (status === null) {
    return pollError ? /* @__PURE__ */ jsx9(ErrorMessage, { message: `\u72B6\u614B\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F: ${pollError}` }) : /* @__PURE__ */ jsx9(ZenSkeleton, {});
  }
  return /* @__PURE__ */ jsxs8("div", { className: "flex flex-col gap-4", children: [
    pollError && /* @__PURE__ */ jsx9(ErrorMessage, { message: `\u72B6\u614B\u3092\u66F4\u65B0\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F: ${pollError}` }),
    actionError && /* @__PURE__ */ jsx9(ErrorMessage, { message: actionError }),
    /* @__PURE__ */ jsxs8("div", { className: "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]", children: [
      /* @__PURE__ */ jsxs8("div", { className: "flex min-w-0 flex-col gap-6", children: [
        /* @__PURE__ */ jsx9(StatusCard, { status }),
        /* @__PURE__ */ jsx9(
          RunForm,
          {
            running: status.running,
            busy,
            configured: status.configured,
            onRun: (request) => void run(request),
            onStop: () => void stop()
          }
        )
      ] }),
      /* @__PURE__ */ jsx9(LogViewer, { logs: status.logs })
    ] })
  ] });
}

// plugins/zen-automation/src/front/index.tsx
import { jsx as jsx10 } from "react/jsx-runtime";
function activate(host) {
  host.registerPage({
    id: "main",
    label: "ZEN Study",
    icon: "Bot",
    component: () => /* @__PURE__ */ jsx10(ZenAutomationPage, { host })
  });
}
export {
  activate as default
};

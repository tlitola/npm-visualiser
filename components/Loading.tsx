import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ProgressBar } from "react-bootstrap";

export default function Loading({
  statusText,
  steps,
  step,
  now,
}: {
  statusText?: string;
  steps: string[];
  step: number;
  now: number;
}) {
  return (
    <div className="tw-w-full">
      <div className="tw-flex tw-w-full tw-items-center">
        {steps.map((el, i) => (
          <Step label={el} now={i > step ? 0 : step === i ? now : 100} key={el} done={now > 100 || step > i} />
        ))}
      </div>
      <p className="tw-mb-0 tw-mt-12 tw-w-full tw-whitespace-pre tw-text-center tw-text-lg tw-font-medium tw-text-slate-700">
        {statusText}
      </p>
    </div>
  );
}

function Step({ now, label, done }: { now: number; label: string; done: boolean }) {
  return (
    <div className="tw-flex tw-h-fit tw-w-full tw-items-center">
      <ProgressBar max={100} now={now} variant="success" className="!tw-h-1 tw-w-full " />
      <div className="tw-relative">
        <div className="tw-m-1 tw-box-border tw-grid tw-h-12 tw-w-12 tw-place-items-center tw-rounded-full tw-border-4 tw-border-solid tw-border-emerald-700">
          <FontAwesomeIcon
            icon={faCheck}
            className={`${!done ? "tw-scale-0" : "tw-scale-100"} tw-h-8 tw-w-8 tw-text-emerald-700`}
          />
        </div>
        <p className="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-text-center tw-text-lg tw-font-medium tw-leading-7 tw-text-slate-700">
          {label}
        </p>
      </div>
    </div>
  );
}

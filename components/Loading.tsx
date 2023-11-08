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
      <div className="tw-flex tw-items-center tw-w-full">
        {steps.map((el, i) => (
          <Step label={el} now={i > step ? 0 : step === i ? now : 100} key={el} done={now > 100 || step > i} />
        ))}
      </div>
      <p className="tw-text-center tw-w-full tw-mt-12 tw-mb-0 tw-text-slate-700 tw-text-lg tw-font-medium tw-whitespace-pre">
        {statusText}
      </p>
    </div>
  );
}

function Step({ now, label, done }: { now: number; label: string; done: boolean }) {
  return (
    <div className="tw-flex tw-items-center tw-w-full tw-h-fit">
      <ProgressBar max={100} now={now} variant="success" className="tw-w-full !tw-h-1 " />
      <div className="tw-relative">
        <div className="tw-h-12 tw-w-12 tw-border-solid tw-border-emerald-700 tw-border-4 tw-rounded-full tw-grid tw-place-items-center tw-box-border tw-m-1">
          <FontAwesomeIcon
            icon={faCheck}
            className={`${!done ? "tw-scale-0" : "tw-scale-100"} tw-text-emerald-700 tw-w-8 tw-h-8`}
          />
        </div>
        <p className="tw-absolute tw-left-1/2 -tw-translate-x-1/2 tw-text-center tw-leading-7 tw-font-medium tw-text-slate-700 tw-text-lg">
          {label}
        </p>
      </div>
    </div>
  );
}

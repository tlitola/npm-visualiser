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
    <div className="w-full px-20 py-10">
      <div className="flex items-center w-full">
        {steps.map((el, i) => (
          <Step label={el} now={i > step ? 0 : step === i ? now : 100} key={el} done={now > 100 || step > i} />
        ))}
      </div>
      <p className="text-center w-full mt-12">{statusText}</p>
    </div>
  );
}

function Step({ now, label, done }: { now: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center w-full h-fit">
      <ProgressBar max={100} now={now} variant="success" className="w-full !h-1 " />
      <div className="relative">
        <div className="h-12 w-12 border-emerald-700 border-4 rounded-full grid place-items-center box-border m-1">
          <FontAwesomeIcon icon={faCheck} className={`${!done ? "scale-0" : "scale-100"}  text-emerald-700 w-8 h-8`} />
        </div>
        <p className="absolute left-1/2 -translate-x-1/2 text-center leading-4">{label}</p>
      </div>
    </div>
  );
}

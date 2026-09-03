import Link from "next/link";
import { toFaDate, toFaDigits } from "@/app/text";
import { craResolutions } from "@/lib/cra/data";

export function ResolutionCollection({ limit = 12 }: { limit?: number }) {
  return (
    <div className="resolution-list resolution-list-compact">
      {craResolutions.slice(0, limit).map((resolution) => (
        <Link className="resolution-row" href={resolution.route} key={resolution.id}>
          <div className="resolution-number">
            <small>جلسه {toFaDigits(resolution.sessionNumber)}</small>
            <strong>{resolution.resolutionNumber ? `مصوبه ${toFaDigits(resolution.resolutionNumber)}` : "مصوبه"}</strong>
          </div>
          <div className="resolution-row-copy">
            <span>{resolution.category}</span>
            <h2>{toFaDigits(resolution.title)}</h2>
            <p>{toFaDate(resolution.approvalDate)}</p>
          </div>
          <b aria-hidden="true">←</b>
        </Link>
      ))}
    </div>
  );
}


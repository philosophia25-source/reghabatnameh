import Link from "next/link";
import { decisionIndexRecords } from "@/app/decision-data";
import { toFaDate, toFaDigits } from "@/app/text";

export function DecisionCollection({ documentIds }: { documentIds: string[] }) {
  const selected = new Set(documentIds);
  const decisions = decisionIndexRecords.filter((decision) => selected.has(decision.id));
  return (
    <div className="decision-grid">
      {decisions.map((decision) => (
        <Link className="decision-card" href={decision.href} key={decision.id}>
          <span>{decision.authority}</span>
          <h2>{toFaDigits(decision.number)}</h2>
          <p>{decision.title}<br />{toFaDigits(decision.type)} · {toFaDate(decision.date)}</p>
        </Link>
      ))}
    </div>
  );
}

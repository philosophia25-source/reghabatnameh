import { AUTHOR } from "@/lib/site";

export function EditorialMeta({ citation }: { citation: string }) {
  return (
    <aside className="editorial-meta" aria-label="اطلاعات انتشار و استناد">
      <div className="editorial-facts">
        <span>نویسنده <b>{AUTHOR.name}</b></span>
        <span>وضعیت <b>منتشرشده</b></span>
      </div>
      <details>
        <summary>شیوه پیشنهادی استناد</summary>
        <p>{citation}</p>
      </details>
    </aside>
  );
}

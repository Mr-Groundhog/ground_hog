import { getCreditComments, getBatches } from "../actions";
import { CreditCodesList } from "./credit-codes-list";
import { CreditCommentsList } from "./credit-comments-list";

export async function CreditCodesWrapper({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}) {
  const [comments, batches] = await Promise.all([
    getCreditComments({ page, limit, search }),
    getBatches(),
  ]);

  return (
    <div className="space-y-6">
      <CreditCodesList
        batches={batches.batches}
        activeBatchId={batches.activeBatchId}
      />
      <CreditCommentsList
        data={comments.data}
        total={comments.total}
        page={page}
        limit={limit}
        totalPages={comments.totalPages}
      />
    </div>
  );
}

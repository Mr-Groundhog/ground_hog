import { getCreditCodes, getCreditComments } from "../actions";
import { CreditCodesList } from "./credit-codes-list";
import { CreditCommentsList } from "./credit-comments-list";

export async function CreditCodesWrapper({
  page,
  limit,
  status,
  search,
}: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}) {
  const [codes, comments] = await Promise.all([
    getCreditCodes({ page, limit, status, search }),
    getCreditComments({ page, limit, search }),
  ]);

  return (
    <div className="space-y-6">
      <CreditCodesList
        data={codes.data}
        total={codes.total}
        page={page}
        limit={limit}
        totalPages={codes.totalPages}
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

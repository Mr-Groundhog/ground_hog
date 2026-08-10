import { getPublicStations } from "../actions";
import { PublicStationsList } from "./public-stations-list";

export async function PublicStationsWrapper({
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
  const { data, total, totalPages } = await getPublicStations({
    page,
    limit,
    status,
    search,
  });

  return (
    <PublicStationsList
      data={data}
      total={total}
      page={page}
      limit={limit}
      totalPages={totalPages}
    />
  );
}

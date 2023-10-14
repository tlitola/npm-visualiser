import { fetchDownloadsHistory } from "@/utils/client/fetchers";
import { Dispatch, SetStateAction } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { CategoricalChartState } from "recharts/types/chart/generateCategoricalChart";
import useSWR from "swr";

export function DownloadsChart({
  packageName,
  updateValue,
}: {
  packageName: string;
  updateValue?: Dispatch<SetStateAction<[string, number] | undefined>>;
}) {
  const { data: downloads } = useSWR(`download-history-${packageName}`, () => fetchDownloadsHistory(packageName), {
    revalidateOnFocus: false,
  });

  const handleMouseMove = (e: CategoricalChartState) => {
    if (!updateValue) return;
    if (!e.activePayload?.at(0)?.payload) {
      updateValue(undefined);
      return;
    }
    const { week, downloads } = e.activePayload?.at(0)?.payload;
    updateValue([week, downloads]);
  };

  const handleMouseLeave = () => {
    updateValue && updateValue(undefined);
  };
  return (
    <ResponsiveContainer height={50}>
      <AreaChart
        id="DownloadStats"
        data={downloads?.downloads}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#641B30" stopOpacity={1} />
            <stop offset="100%" stopColor="#641B30" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <Area
          type={"linear"}
          stroke="#641B30"
          strokeWidth={0.5}
          dataKey={"downloads"}
          dot={false}
          isAnimationActive={false}
          fillOpacity={1}
          fill="url(#fill)"
        />
        <Tooltip wrapperClassName="hidden" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

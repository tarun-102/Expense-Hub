
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryExpenseChartProps {
    labels: string[];
    amounts: number[];
}

const CategoryExpenseChart = ({
    labels,
    amounts,
}: CategoryExpenseChartProps) => {

    const data = {
        labels,
        datasets: [
            {
                data: amounts,
                backgroundColor: [
                    "#635bff",
                    "#16a34a",
                    "#f59e0b",
                    "#ef4444",
                    "#0ea5e9",
                    "#8b5cf6",
                    "#ec4899",
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
            },
        },
    };

    return (
        <div style={{ height: "320px" }}>
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default CategoryExpenseChart;
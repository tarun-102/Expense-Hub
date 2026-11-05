
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
    Title
);

interface IncomeExpenseChartProps {
    labels: string[];
    income: number[];
    expense: number[];
}

const IncomeExpenseChart = ({
    labels,
    income,
    expense,
}: IncomeExpenseChartProps) => {

    const data = {
        labels,
        datasets: [
            {
                label: "Income",
                data: income,
                backgroundColor: "#16a34a",
                borderRadius: 6,
            },
            {
                label: "Expense",
                data: expense,
                backgroundColor: "#ef4444",
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: string | number) =>
                        `₹${Number(value).toLocaleString("en-IN")}`,
                },
            },
        },
    };

    return (
        <div style={{ height: "320px" }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default IncomeExpenseChart;

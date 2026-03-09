export const trainingData = [
    { features: [7.5, 2.0, 28], label: "Clean" },
    { features: [7.4, 2.5, 27], label: "Clean" },
    { features: [7.8, 1.5, 29], label: "Clean" },
    { features: [7.2, 3.0, 26], label: "Clean" },
    { features: [8.5, 0.5, 31], label: "Dirty" },
    { features: [6.5, 4.0, 22], label: "Dirty" },
    { features: [7.0, 0.2, 25], label: "Dirty" },
    { features: [8.0, 5.0, 32], label: "Dirty" },
    { features: [7.6, 1.0, 30], label: "Clean" },
    { features: [6.8, 1.2, 28], label: "Needs Attention" },
    { features: [7.9, 0.8, 29], label: "Needs Attention" },
    { features: [7.3, 3.5, 27], label: "Needs Attention" }
];

export function predictKNN(pH: number, chlorine: number, temp: number): string {
    if (isNaN(pH) || isNaN(chlorine) || isNaN(temp)) return "Unknown";

    const distances = trainingData.map(point => {
        // Basic feature scaling: pH and Chlorine have smaller ranges than Temp.
        // For a simple KNN, Euclidean distance works reasonably well.
        const d = Math.sqrt(
            Math.pow((point.features[0] - pH) * 2, 2) + // scale pH
            Math.pow((point.features[1] - chlorine) * 2, 2) + // scale Chlorine
            Math.pow((point.features[2] - temp) * 0.5, 2) // scale Temp 
        );
        return { label: point.label, distance: d };
    });

    distances.sort((a, b) => a.distance - b.distance);

    const k = 3;
    const nearest = distances.slice(0, k);

    const counts: Record<string, number> = {};
    for (const n of nearest) {
        counts[n.label] = (counts[n.label] || 0) + 1;
    }

    let bestLabel = "Unknown";
    let maxCount = -1;
    for (const label in counts) {
        if (counts[label] > maxCount) {
            maxCount = counts[label];
            bestLabel = label;
        }
    }

    return bestLabel;
}

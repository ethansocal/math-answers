const file = await Bun.file("src/assets/table_of_contents.txt").text();
const sections = [];
let chapter = "";
for (const line of file.split("\n")) {
    if (line.startsWith("Review Exercises")) {
        sections.push({
            page: parseInt(line.split(" ")[line.split(" ").length - 1]),
            section: "R",
            chapter,
        });
    } else if (line.startsWith("P.S.")) {
        sections.push({
            page: parseInt(line.split(" ")[line.split(" ").length - 1]),
            section: "PS",
            chapter,
        });
    } else if (line.split(" ")[0].split(".").length === 2) {
        chapter = line.split(" ")[0].split(".")[0];
        sections.push({
            page: parseInt(line.split(" ")[line.split(" ").length - 1]),
            section: line.split(" ")[0].split(".")[1],
            chapter,
        });
    }
}
Bun.write(
    "src/assets/table_of_contents.json",
    JSON.stringify(sections, null, 4)
);

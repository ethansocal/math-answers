import { useMemo } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import chapters from "./assets/calc_10e_chapters.xml?raw";
import TOC from "./assets/table_of_contents.json";

function ProblemInput({
    problems,
    setProblems,
}: {
    problems: string;
    setProblems: (problems: string) => void;
}) {
    return (
        <textarea
            name="Problems"
            cols={40}
            rows={5}
            value={problems}
            onInput={(e) => {
                setProblems((e.target as HTMLTextAreaElement).value);
            }}
        ></textarea>
    );
}

interface Problem {
    problem: string;
    page: string;
}

function parseProblemInput(input: string): Problem[] {
    /**
     * Input format:
     * 755/1,5,11,17,19,25,27,33
     * 763/45ab,51bc,53,73,75
     */
    const problems: Problem[] = [];
    for (const line of input.split("\n")) {
        if (line.split("/").length !== 2) continue;
        const [page, problemList] = line.split("/");
        if (problemList.split(",").length === 0) continue;
        for (const problem of problemList.split(",")) {
            problems.push({
                problem,
                page,
            });
        }
    }
    return problems;
}

function findProblem(problem: Problem) {
    const chapter = TOC.find((i) => i.page >= parseInt(problem.page));
    if (!chapter) return null;
    return {
        chapter,
        problem:
            chapter.section === "R"
                ? `Review Exercise ${problem.problem}`
                : `Problem ${problem.problem}`,
    };
}

function App() {
    const [problems, setProblems] = useLocalStorage("problems", "");
    const parsedProblems = useMemo<Problem[]>(
        () => parseProblemInput(problems),
        [problems]
    );
    return (
        <>
            <ProblemInput problems={problems} setProblems={setProblems} />
            {parsedProblems.length > 0 && (
                <>
                    <h1>Detected Problems:</h1>
                    <ul>
                        {parsedProblems.map((i) => (
                            <li key={JSON.stringify(i)}>
                                pg. {i.page} #{i.problem}
                            </li>
                        ))}
                    </ul>
                </>
            )}
            <img src="https://ee66b321b2e0a22db2bc-646e12b456b1588b6ef5c188c33a829b.ssl.cf2.rackcdn.com/se11c01005.png" />
        </>
    );
}

export default App;

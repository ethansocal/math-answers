import { useMemo, useState } from "react";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
import chapters from "./assets/calc_10e_chapters.xml?raw";
import TOC from "./assets/table_of_contents.json";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./components/ui/accordion";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";

function ProblemInput({
    problems,
    setProblems,
}: {
    problems: string;
    setProblems: (problems: string) => void;
}) {
    return (
        <Textarea
            placeholder={
                "Should be in the format:\n755/1,5,11,17,19,25,27,33\n763/45ab,51bc,53,73,75\netc."
            }
            rows={5}
            name="Problems"
            value={problems}
            onInput={(e) => {
                setProblems((e.target as HTMLTextAreaElement).value);
            }}
        ></Textarea>
    );
}

interface Problem {
    problem: string;
    page: string;
    chapter: string;
    section: string;
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
        const { chapter, section } = findProblem(parseInt(page))!;
        if (problemList.split(",").length === 0) continue;
        for (const problem of problemList.split(",")) {
            problems.push({
                chapter,
                section,
                problem,
                page,
            });
        }
    }
    return problems;
}

function findProblem(page: number) {
    let last = null;
    for (const section of TOC) {
        if (section.page > page) return last;
        last = section;
    }
    return last;
}

const xml = new DOMParser().parseFromString(chapters, "text/xml");
const baseUrl = xml.querySelector("CHAPTERS")?.getAttribute("SOLUTIONART");
const filetype = xml.querySelector("CHAPTERS")?.getAttribute("FILETYPE");

function getProblemUrl(problem: Problem) {
    const { chapter, section, problem: problemNumber } = problem;
    const element = xml.querySelector(
        `CHAPTER[NAME='${chapter}'] > SECTION[NAME='${section}']`
    );
    if (!element) return null;
    return `${baseUrl}/${element.getAttribute("PRE")}${problemNumber
        .replace(/\D/g, "")
        .padStart(3, "0")}.${filetype}`;
}
function preloadImage(url: string) {
    const img = new Image();
    img.src = url;
}

function App() {
    const [problems, setProblems] = useLocalStorage("problems", "");
    const parsedProblems = useMemo<Problem[]>(
        () => parseProblemInput(problems),
        [problems]
    );
    const [expanded, setExpanded] = useState<string[]>([]);
    const [missing, setMissing] = useState<string[]>([]);
    useDebounce(() => {
        for (const problem of parsedProblems) {
            preloadImage(getProblemUrl(problem)!);
        }
    }, 1000);

    return (
        <div className="p-3">
            <header className="border-b border-black mb-4">
                <h1 className="text-2xl">Calculus Solution Viewer</h1>
            </header>
            <h1>Copy and paste the assignment numbers below:</h1>
            <ProblemInput problems={problems} setProblems={setProblems} />
            {/* <h1>Homework history (by due date):</h1> */}
            {parsedProblems.length > 0 && (
                <>
                    <h1>Detected Problems:</h1>
                    <div className="flex flex-row gap-3">
                        <Button onClick={() => setExpanded([])}>
                            Collapse All
                        </Button>
                        <Button
                            onClick={() =>
                                setExpanded(
                                    parsedProblems.map((i) => JSON.stringify(i))
                                )
                            }
                        >
                            Expand All
                        </Button>
                    </div>
                    <Accordion
                        type="multiple"
                        value={expanded}
                        onValueChange={(e) => {
                            setExpanded(e);
                        }}
                    >
                        {parsedProblems.map((i) => (
                            <AccordionItem
                                value={JSON.stringify(i)}
                                key={JSON.stringify(i)}
                            >
                                <AccordionTrigger>
                                    pg. {i.page} - {i.chapter}.{i.section} #
                                    {i.problem}
                                </AccordionTrigger>
                                <AccordionContent>
                                    {!missing.includes(getProblemUrl(i)!) ? (
                                        <a
                                            href={`https://www.calcchat.com/book/Calculus-10e/${
                                                i.chapter
                                            }/${i.section}}/${i.problem.replace(
                                                /\D/g,
                                                ""
                                            )}/`}
                                            target="_blank"
                                        >
                                            <img
                                                src={getProblemUrl(i) || ""}
                                                onError={() => {
                                                    setMissing((prev) => [
                                                        ...prev,
                                                        getProblemUrl(i)!,
                                                    ]);
                                                }}
                                            />
                                        </a>
                                    ) : (
                                        <p className="p-3 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-300 rounded-lg font-semibold">
                                            Solution not found! If you have a
                                            solution for this problem and would
                                            like it added for others to see,
                                            please email{" "}
                                            <a
                                                href="malito:ethanparkerhenry@gmail.com"
                                                className="underline text-blue-800 dark:text-blue-300"
                                            >
                                                ethanparkerhenry@gmail.com
                                            </a>
                                            .
                                        </p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </>
            )}
        </div>
    );
}

export default App;

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';
import chalk from 'chalk';
import { groupBy, mean } from 'lodash';

type TestAndResult = { test: TestCase; result: TestResult };

class SessionReporter implements Reporter {
  private printTestConsole = false;
  private startTime: number = 0;
  private allTestsCount: number = 0;
  private allResults: Array<TestAndResult> = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.allTestsCount = suite.allTests().length;

    this.printTestConsole = this.allTestsCount <= 1;
    console.log(
      `\t\tStarting the run with ${this.allTestsCount} tests, with ${config.workers} workers and ${config.projects[0].retries} retries`,
    );
    this.startTime = Date.now();
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(
      chalk.magenta(
        `\tStarting test "${test.title}"  ` +
          `${result.retry > 0 ? `Retry #${test.retries}` : ''}`,
      ),
    );
  }

  private getChalkColorForStatus(result: Pick<TestResult, 'status'>) {
    return result.status === 'passed'
      ? chalk.green
      : result.status === 'interrupted'
      ? chalk.yellow
      : chalk.red;
  }

  private testResultToDurationStr(tests: Array<Pick<TestAndResult, 'result'>>) {
    const inSeconds = tests
      .map((m) => m.result)
      .map((r) => Math.floor(r.duration / 1000));
    const formatted = inSeconds.map((m) => `${m}s`).join(',');
    return formatted;
  }

  private formatGroupedByResults(testAndResults: Array<TestAndResult>) {
    const allPassed = testAndResults.every((m) => m.result.status === 'passed');
    const allFailed = testAndResults.every((m) => m.result.status !== 'passed');
    const firstItem = testAndResults[0]; // we know they all have the same state
    const statuses = testAndResults
      .map((m) => `"${m.result.status}"`)
      .join(',');

    const times =
      testAndResults.length === 1
        ? 'once'
        : testAndResults.length === 2
        ? 'twice'
        : `${testAndResults.length} times`;
    console.log(
      `${this.getChalkColorForStatus(
        allPassed
          ? { status: 'passed' }
          : allFailed
          ? { status: 'failed' }
          : { status: 'interrupted' },
      )(
        `\t\t\t"${
          firstItem.test.title
        }": run ${times}, statuses:[${statuses}], durations: [${this.testResultToDurationStr(
          testAndResults,
        )}]`,
      )}`,
    );
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status !== 'passed') {
      console.log(
        `${this.getChalkColorForStatus(result)(
          `\t\tFinished test "${test.title}": ${result.status} with stdout/stderr`,
        )}`,
      );
      result.stdout.map((t) => process.stdout.write(t.toString()));
      console.warn(`stdout:`);
      result.stdout.map((t) => process.stdout.write(t.toString()));

      console.warn('stderr:');
      result.stderr.map((t) => process.stderr.write(t.toString()));
    } else {
      console.log(
        `${this.getChalkColorForStatus(result)(
          `\t\tFinished test "${test.title}": ${result.status}`,
        )}`,
      );
    }
    this.allResults.push({ test, result });

    console.log(`\t\tResults so far:`);
    // we keep track of all the failed/passed states, but only render the passed status here even if it took a few retries

    const { allFailedSoFar, allPassedSoFar, partiallyPassed } =
      this.groupResultsByTestName();

    Object.values(allPassedSoFar).forEach((m) =>
      this.formatGroupedByResults(m),
    );
    Object.values(partiallyPassed).forEach((m) =>
      this.formatGroupedByResults(m),
    );
    Object.values(allFailedSoFar).forEach((m) =>
      this.formatGroupedByResults(m),
    );

    const notPassedCount =
      this.allTestsCount -
      this.allResults.filter((m) => m.result.status === 'passed').length;
    const estimateLeftMs =
      notPassedCount * mean(this.allResults.map((m) => m.result.duration));
    console.log(
      `\t\tRemaining tests: ${notPassedCount}, so rougly ${Math.floor(
        estimateLeftMs / (60 * 1000),
      )}min left...`,
    );
  }

  private groupResultsByTestName() {
    const groupedByTitle = groupBy(this.allResults, (a) => a.test.title);
    const allKeysPassedSoFar = Object.keys(groupedByTitle).filter((k) => {
      return groupedByTitle[k].every((m) => m.result.status === 'passed');
    });

    const keysPartiallyPassedAndFailedSoFar = Object.keys(
      groupedByTitle,
    ).filter((k) => {
      return (
        groupedByTitle[k].some((m) => m.result.status !== 'passed') &&
        groupedByTitle[k].some((m) => m.result.status === 'passed')
      );
    });

    const allKeysFailedSoFar = Object.keys(groupedByTitle).filter((k) => {
      return groupedByTitle[k].every((m) => m.result.status !== 'passed');
    });

    return {
      allPassedSoFar: groupBy(
        this.allResults.filter((m) =>
          allKeysPassedSoFar.includes(m.test.title),
        ),
        (m) => m.test.title,
      ),
      allFailedSoFar: groupBy(
        this.allResults.filter((m) =>
          allKeysFailedSoFar.includes(m.test.title),
        ),
        (m) => m.test.title,
      ),
      partiallyPassed: groupBy(
        this.allResults.filter((m) =>
          keysPartiallyPassedAndFailedSoFar.includes(m.test.title),
        ),
        (m) => m.test.title,
      ),
    };
  }

  onEnd(result: FullResult) {
    console.log(
      chalk.bgWhiteBright(
        `\n\n\n\t\tFinished the run: ${result.status}, took ${Math.floor(
          (Date.now() - this.startTime) / (60 * 1000),
        )} minute(s)`,
      ),
    );
    const { allFailedSoFar, allPassedSoFar, partiallyPassed } =
      this.groupResultsByTestName();

    Object.values(allPassedSoFar).forEach((m) =>
      this.formatGroupedByResults(m),
    );
    Object.values(partiallyPassed).forEach((m) =>
      this.formatGroupedByResults(m),
    );
    Object.values(allFailedSoFar).forEach((m) =>
      this.formatGroupedByResults(m),
    );
  }

  onStdOut?(
    chunk: string | Buffer,
    test: void | TestCase,
    _result: void | TestResult,
  ) {
    if (this.printTestConsole) {
      process.stdout.write(
        `"${test ? `${chalk.cyanBright(test.title)}` : ''}": ${chunk}`,
      );
    }
  }

  onError?(error: TestError) {
    console.warn('global error:', error);
  }
}

export default SessionReporter;

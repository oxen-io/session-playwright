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

class MyReporter implements Reporter {
  private printTestConsole = false;
  private startTime: number = 0;
  private allTestsCount: number = 0;
  private allResults: Array<{ test: TestCase; result: TestResult }> = [];

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

  private getChalkColorForStatus(result: TestResult) {
    return result.status === 'passed'
      ? chalk.green
      : result.status === 'interrupted'
      ? chalk.yellow
      : chalk.red;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(
      `${this.getChalkColorForStatus(result)(
        `\t\tFinished test "${test.title}": ${result.status} with stdout/stderr`,
      )}`,
    );
    if (result.status !== 'passed') {
      console.warn(
        'stdout: ',
        result.stdout.map((t) => process.stdout.write(t.toString())),
      );
      console.warn(
        'stderr: ',
        result.stderr.map((t) => process.stderr.write(t.toString())),
      );
    }
    this.allResults.push({ test, result });

    console.log(`\t\tResults so far:`);
    // we keep track of all the failed/passed states, but only render the passed status here even if it took a few retries

    const resultsWhichPassed = this.getAllPassedAtLeastOnce();
    const resultsWhichFailed = this.getAllNotPassedYet();
    [...resultsWhichPassed, ...resultsWhichFailed].forEach((t) => {
      console.log(
        `${this.getChalkColorForStatus(t.result)(
          `\t\t\t"${t.test.title}":   status:${
            t.result.status
          }, duration ${Math.floor(t.result.duration / 1000)}s`,
        )}`,
      );
    });

    const notPassedCount =
      this.allTestsCount -
      this.allResults.filter((m) => m.result.status === 'passed').length;
    console.log(`\t\tRemaining tests:`, notPassedCount);
  }

  private getAllPassedAtLeastOnce() {
    return this.allResults.filter((m) => m.result.status === 'passed');
  }

  private getAllNotPassedYet() {
    const allPassed = this.getAllPassedAtLeastOnce();
    return this.allResults.filter(
      (m) => !allPassed.some((passed) => passed.test.id === m.test.id),
    );
  }

  onEnd(result: FullResult) {
    console.log(
      chalk.bgWhiteBright(
        `\n\n\n\t\tFinished the run: ${result.status}, took ${Math.floor(
          (Date.now() - this.startTime) / (60 * 1000),
        )} minute`,
      ),
    );
    const resultsWhichPassed = this.getAllPassedAtLeastOnce();
    const resultsWhichFailed = this.getAllNotPassedYet();

    console.log(chalk.green(`\n\n\t\tAll passing tests:`));
    resultsWhichPassed.forEach((t) => {
      console.log(
        `${this.getChalkColorForStatus(t.result)(
          `\t\t\t"${t.test.title}":   status:${
            t.result.status
          }, duration ${Math.floor(t.result.duration / 1000)}s`,
        )}`,
      );
    });

    console.log(chalk.red(`\n\n\t\tAll failing tests:`));
    resultsWhichFailed.forEach((t) => {
      console.log(
        `${this.getChalkColorForStatus(t.result)(
          `\t\t\t"${t.test.title}":   status:${
            t.result.status
          }, duration ${Math.floor(t.result.duration / 1000)}s`,
        )}`,
      );
    });
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

export default MyReporter;

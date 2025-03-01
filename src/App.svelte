<script lang="ts">
  import { cubicInOut, cubicOut } from "svelte/easing";
  import { formatFromSeconds } from "./lib/utils";
  import { Tween } from "svelte/motion";

  /// State Management

  let initialized = false;

  let isRunning = $state(false);
  let isActiveTimerPaused = $state(false);
  let currentTimerID: number | null = $state(null);
  
  /// Pomodoro states

  let completedPomodoros = $state(0);
  let objectivePomodoros = $state(8);
  let isObjectiveCompleted = $derived(completedPomodoros >= objectivePomodoros);
  let isLongBreak = $derived(
    completedPomodoros !== 0 && completedPomodoros % 4 === 0
  );

  let currentTimerType: "work" | "break" | "longBreak" = $state("work");
  let pastTimerType: "work" | "break" | "longBreak" = $state("work");

  let longBreakTime = $state(15 * 60);
  let breakTime = $state(5 * 60);
  let workTime = $state(25 * 60);

  let startTime = $state(0);
  let elapsedTime = $state(0);
  let remainingTime = $state(0);

  /// UI State

  let formattedRemainingTime = $derived(formatFromSeconds(remainingTime));

  let remainingTimePercentage = Tween.of(() => (elapsedTime / 1000) / workTime * 100, {
    duration: 300,
    easing: cubicInOut,
  }); /// For progress bars
  let completedPomodoroPercentage = $derived(
    (completedPomodoros / objectivePomodoros) * 100
  );
  let remainingPomodoros = $derived(objectivePomodoros - completedPomodoros);

  /// Initialization

  $effect(() => {
    if (initialized) return;
    remainingTime = workTime;
    initialized = true;
  });

  const onTick = () => {
    elapsedTime = Date.now() - startTime;

    if (currentTimerType === "work") {
      remainingTime = workTime - Math.floor(elapsedTime / 1000);
    } else if (currentTimerType === "break") {
      remainingTime = breakTime - Math.floor(elapsedTime / 1000);
    } else if (currentTimerType === "longBreak") {
      remainingTime = longBreakTime - Math.floor(elapsedTime / 1000);
    }

    if (remainingTime <= 0) {

      if (remainingPomodoros === 0) {
        return stopTimer();
      }
      if (currentTimerType === "break") {
        currentTimerType = "work";
        remainingTime = workTime;
        return onTimerCompletion();
      }
      if (currentTimerType === "longBreak") {
        currentTimerType = "work";
        remainingTime = workTime;
        return onTimerCompletion();
      }
        if (currentTimerType === "work") {
        onPomodoroCompletion();
        currentTimerType = isLongBreak ? "longBreak" : "break";
        remainingTime = isLongBreak ? longBreakTime : breakTime;
        return onTimerCompletion();
      }
    }
  };

  const startTimer = () => {
    currentTimerID ? clearInterval(currentTimerID) : null;
    isRunning = true;
    if (!isRunning) {
      startTime = Date.now() - elapsedTime;
    } else {
      startTime = Date.now();
    }
    currentTimerID = setInterval(() => {
      onTick();
    }, 1000);
  };

  const stopTimer = () => {
    isRunning = false;
    currentTimerID ? clearInterval(currentTimerID) : null;
  };

  const resetTimer = () => {
    stopTimer();
    remainingTime = workTime;
    elapsedTime = 0;
  };
  const onPomodoroCompletion = () => {
    return completedPomodoros += 1;
  }
  const onTimerCompletion = () => {
    stopTimer();
    resetTimer();
    startTimer();    


    // if (currentTimerType === "work") {
    //   completedPomodoros += 1;

    //   if (isObjectiveCompleted) {
    //     return stopTimer();
    //   }

    //     if (isLongBreak) {
    //   console.log("Long Break");
    //   currentTimerType = "longBreak";
    //   remainingTime = longBreakTime;
    //   return startTimer();
    // } else if (currentTimerType === "break") {
    //   remainingTime = breakTime;
    //   return startTimer();
    // } else if (currentTimerType === "break") {
    //   currentTimerType = "work";
    //   remainingTime = workTime;
    //   return startTimer();
    // }
  };

  const handleStart = () => {
    startTimer();
  };
</script>

<main class="container flex flex-col items-center justify-center h-screen">
  <h1>Pomobun</h1>
  <progress class="w-1/2" value={remainingTimePercentage.current} max={100}></progress>
  <progress class="w-1/2" value={completedPomodoroPercentage} max="100"
  ></progress>
  <p>
    {currentTimerType}
  </p>
  <p>
    {completedPomodoros}/{objectivePomodoros}
  </p>
  <p>
    {isObjectiveCompleted
      ? "Objective Completed"
      : `${remainingPomodoros} More to go`}
  </p>
  <p>
    {formattedRemainingTime}
  </p>
  <p>
    {isRunning ? "Running" : "Stopped"}
  </p>
  <div class="flex flex-col gap-4">
    <div>
      <button onclick={handleStart}>Start</button>
      <button
        disabled={!isRunning}
        class={isRunning ? "" : "opacity-50 cursor-not-allowed"}
        onclick={stopTimer}>Stop</button
      >
      <button onclick={resetTimer}>Reset</button>
    </div>
    <div class="flex flex-col bg-gray-50 rounded-2xl">
      <button> Time settings</button>
    </div>
  </div>
</main>

<style>
</style>

<script lang="ts">
  import { formatFromSeconds } from "./lib/utils";

  /// Enums


  /// State Management
  
  let currentTimerType: "work" | "break" | "longBreak" = $state("work");

  let initialized = false;

  let isRunning = $state(false);
  let isActiveTimerPaused = $state(false);
  let isBreak = $state(false);
  let isLongBreak = $state(false);
  let currentTimerID: number | null = $state(null);

  /// Pomodoro states

  let completedPomodoros = $state(0);
  let objectivePomodoros = $state(4);
  let isObjectiveCompleted = $derived(completedPomodoros >= objectivePomodoros);

  let longBreakTime = $state(15 * 60);
  let breakTime = $state(5 * 60);
  let workTime = $state(25 * 60);

  let startTime = $state(0);
  let elapsedTime = $state(0);
  let remainingTime = $state(0);

  /// UI State

  let formattedRemainingTime = $derived(formatFromSeconds(remainingTime));

  let remainingTimePercentage = $derived((remainingTime / workTime) * 100); /// For progress bars
  let completedPomodoroPercentage = $derived((completedPomodoros / objectivePomodoros) * 100)
  let remainingPomodoros = $derived(objectivePomodoros - completedPomodoros);

  /// Initialization

  $effect(() => {
    if (initialized) return;
    remainingTime = workTime;
    initialized = true;
  });


  const onTick = () => {
    elapsedTime = Date.now() - startTime;
    remainingTime = workTime - Math.floor(elapsedTime / 1000);
    if (elapsedTime >= workTime * 1000) {
      stopTimer();
      onPomoCompletion();
    }
  };

  const startTimer = () => {
    isRunning = true;
    if (isActiveTimerPaused) {
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
    isActiveTimerPaused = true;
    currentTimerID ? clearInterval(currentTimerID) : null;
  };

  const resetTimer = () => {
    stopTimer();
    isActiveTimerPaused = false;
    remainingTime = workTime;
    elapsedTime = 0;
  };

  const onPomoCompletion = () => {
    completedPomodoros = completedPomodoros + 1;
    if (completedPomodoros === objectivePomodoros) {
    }
  };

  const handleStart = () => {
    startTimer();
  };
</script>

<main class="container flex flex-col items-center justify-center h-screen">
  <h1>Pomobun</h1>
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

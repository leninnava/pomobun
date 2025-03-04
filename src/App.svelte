<script lang="ts">
  import { cubicInOut } from "svelte/easing";
  import { formatFromSeconds, formatHMSToSeconds } from "./lib/utils";
  import { Tween } from "svelte/motion";
  /// State Management

  let initialized = false;

  let isRunning = $state(false);
  let currentTimerID: number | null = $state(null);

  /// Pomodoro states

  

  let currentTimerType: "work" | "break" | "longBreak" = $state("work");

  let settings = $state({
    workTime: 25 * 60,
    breakTime: 5 * 60,
    longBreakTime: 15 * 60,
    objectivePomodoros: 8,
    completedPomodoros: 0,
    remainingTime: 0,
    startTime: 0,
    elapsedTime: 0,
  });
  
  
  let isObjectiveCompleted = $derived(settings.completedPomodoros >= settings.objectivePomodoros);
  let isLongBreak = $derived(
    settings.completedPomodoros !== 0 && settings.completedPomodoros % 4 === 0
  );

  /// UI State

  let formattedRemainingTime = $derived(formatFromSeconds(settings.remainingTime));
  
  let currentTimerDuration = $derived(
    currentTimerType === "work"
      ? settings.workTime
      : currentTimerType === "break"
      ? settings.breakTime
      : settings.longBreakTime
  );

  let remainingTimePercentage = Tween.of(
    () => (settings.elapsedTime / 1000 / currentTimerDuration) * 100,
    {
      duration: 300,
      easing: cubicInOut,
    }
  ); /// For progress bars
  let completedPomodoroPercentage = $derived(
    (settings.completedPomodoros / settings.objectivePomodoros) * 100
  );
  let remainingPomodoros = $derived(settings.objectivePomodoros - settings.completedPomodoros);


  /// Initialization

  $effect(() => {
    initialized = true;
    settings.remainingTime = currentTimerDuration;
  });

  let settingsModal: HTMLDialogElement;


  const onTick = () => {
     if (isObjectiveCompleted) {
        return stopTimer();
      }
    settings.elapsedTime = Date.now() - settings.startTime;
    settings.remainingTime = currentTimerDuration - Math.floor(settings.elapsedTime / 1000);

    if (settings.remainingTime <= 0) {
     
      if (currentTimerType === "break" || currentTimerType === "longBreak") {
        
        currentTimerType = "work";
        settings.remainingTime = currentTimerDuration;
        return onTimerCompletion();
      }
      if (currentTimerType === "work") {
        onPomodoroCompletion();
        currentTimerType = isLongBreak ? "longBreak" : "break";
        settings.remainingTime = currentTimerDuration;
        return onTimerCompletion();
      }
    }
  };

  const startTimer = () => {
    isRunning = true;
    if (isRunning) {
      settings.startTime = Date.now() - settings.elapsedTime;
    } else {
      settings.startTime = Date.now();
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
    settings.remainingTime = currentTimerDuration;
    settings.elapsedTime = 0;
  };
  const onPomodoroCompletion = () => {
    return (settings.completedPomodoros += 1);
  };
  const onTimerCompletion = () => {
    resetTimer();
    startTimer();
  };

</script>

<main class="container flex flex-col items-center justify-center h-screen">
  <h1>Pomobun</h1>
  <progress class="" value={remainingTimePercentage.current} max={100}
  ></progress>
  <progress class="" value={completedPomodoroPercentage} max="100"></progress>
  <p>
    Current session:
    <span class="font-bold">
      {currentTimerType}
    </span>
  </p>
  <p>
    {settings.completedPomodoros}/{settings.objectivePomodoros}
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
      <button disabled={isRunning} 
        class={!isRunning ? "" : "opacity-50 cursor-not-allowed"}
       
      onclick={startTimer}>Start</button>
      <button
        disabled={!isRunning}
        class={isRunning ? "" : "opacity-50 cursor-not-allowed"}
        onclick={stopTimer}>Stop</button
      >
      <button onclick={resetTimer}>Reset</button>
    </div>
    <div class="flex flex-col bg-gray-50 rounded-2xl">
      <button onclick={() => settingsModal.showModal()}>Time settings</button>
    </div>
  </div>
  <dialog bind:this={settingsModal} class="m-auto rounded-lg h-80 p-6">
    <h2>Set your time settings</h2>
    <form
      method="dialog"
      class="flex flex-col gap-4"
      onsubmit={(e) => {

        /// extract form data
        const formData = new FormData(e.target as HTMLFormElement);
        const workTime = String(formData.get("workTime"));
        const breakTime = String(formData.get("breakTime"));
        const longBreakTime = String(formData.get("longBreakTime"));
        const objectivePomodoros = Number(formData.get("objectivePomodoros"));


        settings = {
          ...settings,
          workTime: formatHMSToSeconds(workTime),
          breakTime: formatHMSToSeconds(breakTime),
          longBreakTime: formatHMSToSeconds(longBreakTime),
          remainingTime: formatHMSToSeconds(workTime),
          objectivePomodoros,
        };
        settingsModal.close();
      }}
    >
      <label for="workTime">Work Time</label>
      <input type="time" id="workTime " name="workTime" step="2" value={formatFromSeconds(settings.workTime)} />
      <label for="breakTime">Break Time</label>
      <input type="time" id="breakTime" name="breakTime" step="2" value={formatFromSeconds(settings.breakTime)} />
      <label for="longBreakTime">Long Break Time</label>
      <input type="time" id="longBreakTime" name="longBreakTime" step="2" value={formatFromSeconds(settings.longBreakTime)} />
      <label for="objectivePomodoros">Objective Pomodoros</label>
      <input type="number" id="objectivePomodoros" name="objectivePomodoros" value={settings.objectivePomodoros} />

      <button type="submit">Save</button>
    </form>
  </dialog>
</main>

<style>
</style>

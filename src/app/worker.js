import { env, pipeline } from "@huggingface/transformers";
env.allowLocalModels = false;

class PipelineSingleton {
  static task = "text-classification";
  static model = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        this.instance = await pipeline(this.task, this.model, { progress_callback });
      } catch (error) {
        console.error("Error initializing pipeline:", error);
        throw error;
      }
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  try {
    if (event.data.action === "init") {
      await PipelineSingleton.getInstance((x) => {
        self.postMessage({ status: "progress", message: x });
      });
      self.postMessage({ status: "ready" });
    } else if (event.data.action === "classify") {
      let classifier = await PipelineSingleton.getInstance();
      let output = await classifier(event.data.text);
      self.postMessage({
        status: "complete",
        output: output,
      });
    }
  } catch (error) {
    self.postMessage({
      status: "error",
      message: error.toString(),
    });
  }
});

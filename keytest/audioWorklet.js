class MicrophoneProcessor extends AudioWorkletProcessor {
  process (inputs, outputs, parameters) {
    const input = inputs[0]

    if (input && input.length > 0) {
      const sampleCount = input[0].length
      const outputData = new Float32Array(sampleCount)
      outputData.fill(0)

      // Get data from all channels
      for (let channel = 0; channel < input.length; channel++) {
        const inputChannel = input[channel]
        for (let i = 0; i < sampleCount; i++) {
          outputData[i] += inputChannel[i]
        }
      }

      // Donwmix to mono
      const channelCount = input.length
      for (let i = 0; i < sampleCount; i++) {
        outputData[i] /= channelCount
      }

      // Send data to main thread
      this.port.postMessage({
        outputData
      })
    }

    return true
  }
}

registerProcessor('microphone-processor', MicrophoneProcessor)

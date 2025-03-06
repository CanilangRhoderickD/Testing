// This is a development utility to generate game sound effects
export function generateSoundEffects() {
  const audioContext = new AudioContext();
  
  // Correct answer sound
  const correctBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
  const correctChannel = correctBuffer.getChannelData(0);
  for (let i = 0; i < correctBuffer.length; i++) {
    correctChannel[i] = Math.sin(440 * Math.PI * 2 * i / audioContext.sampleRate) * 
      Math.exp(-3 * i / correctBuffer.length);
  }
  
  // Wrong answer sound
  const wrongBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
  const wrongChannel = wrongBuffer.getChannelData(0);
  for (let i = 0; i < wrongBuffer.length; i++) {
    wrongChannel[i] = Math.sin(220 * Math.PI * 2 * i / audioContext.sampleRate) * 
      Math.exp(-5 * i / wrongBuffer.length);
  }
  
  // Level up fanfare
  const levelUpBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate);
  const levelUpChannel = levelUpBuffer.getChannelData(0);
  for (let i = 0; i < levelUpBuffer.length; i++) {
    levelUpChannel[i] = (
      Math.sin(523.25 * Math.PI * 2 * i / audioContext.sampleRate) +
      Math.sin(659.25 * Math.PI * 2 * i / audioContext.sampleRate) +
      Math.sin(783.99 * Math.PI * 2 * i / audioContext.sampleRate)
    ) / 3 * Math.exp(-2 * i / levelUpBuffer.length);
  }
  
  // Achievement unlock sound
  const achievementBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.8, audioContext.sampleRate);
  const achievementChannel = achievementBuffer.getChannelData(0);
  for (let i = 0; i < achievementBuffer.length; i++) {
    achievementChannel[i] = (
      Math.sin(440 * Math.PI * 2 * i / audioContext.sampleRate) +
      Math.sin(554.37 * Math.PI * 2 * i / audioContext.sampleRate)
    ) / 2 * Math.exp(-1 * i / achievementBuffer.length);
  }
  
  // Click sound
  const clickBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
  const clickChannel = clickBuffer.getChannelData(0);
  for (let i = 0; i < clickBuffer.length; i++) {
    clickChannel[i] = Math.sin(880 * Math.PI * 2 * i / audioContext.sampleRate) * 
      Math.exp(-10 * i / clickBuffer.length);
  }

  return {
    correct: correctBuffer,
    wrong: wrongBuffer,
    levelUp: levelUpBuffer,
    achievement: achievementBuffer,
    click: clickBuffer
  };
}

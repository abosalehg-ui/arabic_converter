import { Wand2 } from 'lucide-react';
import { ProcessorTab, TabExamples } from './ProcessorTab';

export function ColoredTextProcessor() {
  return (
    <ProcessorTab
      id="color"
      primaryIcon={Wand2}
      primaryLabel="color.process"
      after={<TabExamples id="color" />}
    />
  );
}

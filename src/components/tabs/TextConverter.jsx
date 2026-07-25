import { ArrowRight } from 'lucide-react';
import { ProcessorTab, TabExamples } from './ProcessorTab';

export function TextConverter() {
  return (
    <ProcessorTab
      id="text"
      primaryIcon={ArrowRight}
      primaryLabel="actions.convert"
      after={<TabExamples id="text" />}
    />
  );
}

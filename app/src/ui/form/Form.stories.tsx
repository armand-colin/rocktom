import { useState } from "react";
import { useComponent } from "@niloc/ecs-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormSchema } from "../../form/FormSchema";
import { FormField } from "../../form/FormField";
import { useForm } from "../../hooks/useForm";
import { Button } from "../button/Button";
import { NumberInput } from "../input/NumberInput";
import { StringInput } from "../input/StringInput";
import { Form } from "./Form";

const meta = {
  title: "UI/Form",
  component: StoryContent,
} satisfies Meta<typeof StoryContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoFormSchema = new FormSchema({
  title: FormField.string().min(3),
  email: FormField.email(),
  nickname: FormField.string().optional(),
  age: FormField.string(),
});

function StoryContent() {
  const [age, setAge] = useState(28);
  const [lastSubmit, setLastSubmit] = useState<string>("No submit yet");
  const handler = useForm(DemoFormSchema);
  const { loading } = useComponent(handler);

  async function onSubmit(result: { json: { title: string; email: string; nickname: string | null; age: string } }) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLastSubmit(JSON.stringify(result.json, null, 2));
  }

  return (
    <Form handler={handler} onSubmit={onSubmit}>
      <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <StringInput
          field={handler.fields.title}
          placeholder="Form title"
        />
        <StringInput
          field={handler.fields.email}
          type="email"
          placeholder="you@example.com"
        />
        <StringInput
          field={handler.fields.nickname}
          placeholder="Optional nickname"
        />
        <NumberInput
          name={handler.fields.age.name}
          value={age}
          min={0}
          max={130}
          step={1}
          onChange={setAge}
        />
        <Button disabled={loading}>
          {loading ? "Submitting..." : "Submit form"}
        </Button>
      </div>

      <pre style={{ marginTop: 16 }}>{lastSubmit}</pre>
    </Form>
  );
}

export const Playground: Story = {
  render: () => <StoryContent />,
};

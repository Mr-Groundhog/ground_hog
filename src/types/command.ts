export interface CommandExample {
  cmd: string;
  note: string;
}

export interface Command {
  id: string;
  name: string;
  desc: string;
  category: string;
  examples: CommandExample[];
}

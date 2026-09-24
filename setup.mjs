import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const run = (command, args) => {
  execFileSync(command, args, { stdio: "inherit" });
};

const output = (command, args) =>
  execFileSync(command, args, { encoding: "utf8" });

const parseSupabaseEnv = (value) =>
  Object.fromEntries(
    value
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("=");
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^"|"$/g, ""),
        ];
      }),
  );

try {
  run("docker", ["version"]);
} catch {
  console.error("\nDocker Desktop no está disponible. Instalalo o inicialo y repetí `pnpm setup`.\n");
  process.exit(1);
}

run("pnpm", ["exec", "supabase", "start"]);

const supabase = parseSupabaseEnv(
  output("pnpm", ["exec", "supabase", "status", "-o", "env"]),
);

const frontendDirectory = "../frontend";

if (existsSync(frontendDirectory)) {
  writeFileSync(
    `${frontendDirectory}/.env.local`,
    [
      "APP_URL=http://localhost:3000",
      `NEXT_PUBLIC_SUPABASE_URL=${supabase.API_URL}`,
      `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${supabase.PUBLISHABLE_KEY}`,
      "",
    ].join("\n"),
  );
}

run("docker", ["compose", "up", "-d", "redis"]);

console.log("\nBackend preparado. Ejecutá `pnpm dev` aquí y también en ../frontend.\n");

import { setupServer } from "../server";

const appPromise = setupServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};

import { type AppType } from "next/app";

import { trpc } from "../utils/trpc";

import { AppHeader } from "../components";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <AppHeader />
      <Component {...pageProps} />
    </>
  );
};

export default trpc.withTRPC(MyApp);

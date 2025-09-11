import LogsContainer from "./_components/logs-container";

export const generateMetadata = async () => {
  return {
    title: "Events & Logs",
  };
};

export default async function LogsPage() {
  return <LogsContainer />;
}

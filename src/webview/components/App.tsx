import { ChakraProvider, Text } from "@chakra-ui/react";
import * as React from "react";

const App = () => {
  const [buttonText, setButtonText] = React.useState("The brain is pending");
  const [stats, setStats] = React.useState<{
    today: { count: number; timeSaved: number };
    thisWeek: { count: number; timeSaved: number };
    thisMonth: { count: number; timeSaved: number };
  }>({
    today: { count: 0, timeSaved: 0 },
    thisWeek: { count: 0, timeSaved: 0 },
    thisMonth: { count: 0, timeSaved: 0 },
  });
  const [topRepositories, setTopRepositories] = React.useState<{
    repository: string;
    count: number;
  }[]>([]);

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "startup":
          setStats(message.stats);
          setTopRepositories(message.topRepositories);
          break;
        case "refresh":
          setStats(message.stats);
          setTopRepositories(message.topRepositories);
          break;
      }
    });
  });

  return (
    <ChakraProvider>
      <Text fontSize="xl">Auto-completion events</Text>
      <Text>Today: {stats.today.count} ({stats.today.timeSaved.toFixed(2)} min saved)</Text>
      <Text>
        This week: {stats.thisWeek.count} ({stats.thisWeek.timeSaved.toFixed(2)}{" "}
        min saved)
      </Text>
      <Text>
        This month: {stats.thisMonth.count} (
        {stats.thisMonth.timeSaved.toFixed(2)} min saved)
      </Text>
      <br />
      <Text fontSize="lg">Top repositories</Text>
      {topRepositories.length > 0 ? (
        topRepositories.map((repo) => (
          <Text key={repo.repository}>
            {repo.repository}: {repo.count}
          </Text>
        ))
      ) : (
        <Text>N/A</Text>
      )}
    </ChakraProvider>
  );
};

export default App;

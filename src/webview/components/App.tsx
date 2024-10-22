import * as React from "react";

const App = () => {
  const [stats, setStats] = React.useState<{
    today: { count: number; timeSaved: number };
    thisWeek: { count: number; timeSaved: number };
    thisMonth: { count: number; timeSaved: number };
  }>({
    today: { count: 0, timeSaved: 0 },
    thisWeek: { count: 0, timeSaved: 0 },
    thisMonth: { count: 0, timeSaved: 0 },
  });
  const [topRepositories, setTopRepositories] = React.useState<
    {
      repository: string;
      count: number;
    }[]
  >([]);

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
    <>
      <div style={{ fontSize: 'large' }}>Auto-completion events</div>
      <ul>
        <li>Today: {stats.today.count} ({stats.today.timeSaved.toFixed(2)} min saved)</li>
        <li>This week: {stats.thisWeek.count} ({stats.thisWeek.timeSaved.toFixed(2)} min saved)</li>
        <li>This month: {stats.thisMonth.count} ({stats.thisMonth.timeSaved.toFixed(2)} min saved)</li>
      </ul>
      <br />
      <div style={{ fontSize: 'large' }}>Top repositories</div>
      {topRepositories.length > 0 ? (
        <ul>
          {topRepositories.map((repo) => (
            <li key={repo.repository}>
              {repo.repository}: {repo.count}
            </li>
          ))}
        </ul>
      ) : (
        <div>N/A</div>
      )}
      </>
  );
};

export default App;

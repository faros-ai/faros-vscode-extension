import * as React from "react";
import {
  calendarDayIcon,
  calendarWeekIcon,
  calendarMonthIcon,
  eventsCountIcon,
  timeSavedIcon,
  repositoryIcon,
} from "./Icons";

import { gridItemStyle, gridStyle, panelStyle, subtitleStyle, titleStyle } from "./Styles";

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

  const formatTimeSaved = (timeSaved: number) => timeSaved >= 60 ? (timeSaved / 60).toFixed(2) + " hours" : timeSaved.toFixed(2) + " min";

  return (
    <>
      <div style={panelStyle}>
        <div style={titleStyle}>My Stats</div>
        <div style={subtitleStyle}>Time saved from auto-completion</div>
        <div style={gridStyle("auto auto auto")}>
          <div style={{...gridItemStyle, marginRight: "20px"}}>{calendarDayIcon} Today</div>
          <div style={{...gridItemStyle, marginRight: "20px"}}>{eventsCountIcon}{stats.today.count}</div>
          <div style={gridItemStyle}>{timeSavedIcon} {formatTimeSaved(stats.today.timeSaved)}</div>
          <div style={{...gridItemStyle, marginRight: "20px"}}>{calendarWeekIcon} This week</div>
          <div style={{...gridItemStyle, marginRight: "20px"}}>{eventsCountIcon}{stats.thisWeek.count}</div>
          <div style={gridItemStyle}>{timeSavedIcon} {formatTimeSaved(stats.thisWeek.timeSaved)}</div>
          <div style={{...gridItemStyle, marginRight: "20px"}}>{calendarMonthIcon} This month</div>
          <div style={{...gridItemStyle, marginRight: "20px"}}>{eventsCountIcon}{stats.thisMonth.count}</div>
          <div style={gridItemStyle}>{timeSavedIcon} {formatTimeSaved(stats.thisMonth.timeSaved)}</div>
        </div>
      </div>


      <div style={panelStyle}>
        <div style={titleStyle}>Top Repositories</div>
        <div style={subtitleStyle}>Repositories with the highest auto-completion</div>
        {topRepositories.length > 0 ? (
          <div style={gridStyle("auto auto")}>
            {topRepositories.map((repo) => (
              <>
                <div style={{...gridItemStyle, marginRight: "70px"}}>
                  {repositoryIcon(topRepositories.indexOf(repo))}
                  {repo.repository}
                </div>
                <div style={{...gridItemStyle, justifyContent: "flex-end"}}>{repo.count}</div>
              </>
            ))}
          </div>
        ) : (
          <div>N/A</div>
        )}
      </div>
    </>
  );
};

export default App;

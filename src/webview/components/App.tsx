import * as React from "react";
import {
  calendarDayIcon,
  calendarWeekIcon,
  calendarMonthIcon,
  eventsCountIcon,
  timeSavedIcon,
  repositoryIcon,
  percentageIcon,
  chevronIcon,
} from "./Icons";
import {detailsCollapseButtonStyle, detailsGridStyle, gridItemStyle, overviewGridStyle, panelStyle, subtitleStyle, titleStyle } from "./Styles";
import { ThemeType } from "./types";

const App = () => {
  const [stats, setStats] = React.useState<{
    total: { count: number; timeSaved: number };
    today: { count: number; timeSaved: number };
    thisWeek: { count: number; timeSaved: number };
    thisMonth: { count: number; timeSaved: number };
  }>({
    total: { count: 0, timeSaved: 0 },
    today: { count: 0, timeSaved: 0 },
    thisWeek: { count: 0, timeSaved: 0 },
    thisMonth: { count: 0, timeSaved: 0 },
  });
  const [ratios, setRatios] = React.useState<{
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  }>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [topRepositories, setTopRepositories] = React.useState<
    {
      repository: string;
      count: number;
    }[]
  >([]);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeType>("Dark");
  
  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const message = event.data; // The json data that the extension sent
      switch (message.command) {
        case "startup":
          setStats(message.stats);
          setRatios(message.ratios);
          setTopRepositories(message.topRepositories);
          break;
        case "refresh":
          setStats(message.stats);
          setRatios(message.ratios);
          setTopRepositories(message.topRepositories);
          break;
        case "themeChanged":
          setTheme(message.theme as ThemeType);
          break;
      }
    });
  });

  const formatTimeSaved = (timeSaved: number) => {
    const hours = Math.floor(timeSaved / 60);
    const minutes = Math.round(timeSaved % 60);
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };
  const formatPercentage = (percentage: number) => percentage ? (percentage * 100).toFixed(0) + "%" : "N/A";

  return (
    <>
      <div style={panelStyle}>
        <div style={titleStyle}>My Stats</div>
        <div style={subtitleStyle}>Overview of my auto-completion usage</div>
        <div style={overviewGridStyle()}>
          <div style={gridItemStyle()}>{eventsCountIcon}Total Auto-completions</div><div style={gridItemStyle({justifyContent: "flex-end"})}>{stats.total.count}</div>
          <div style={gridItemStyle()}>{timeSavedIcon}Time saved</div><div style={gridItemStyle({justifyContent: "flex-end"})}>{formatTimeSaved(stats.total.timeSaved)}</div>
          <div style={gridItemStyle({gap: "5px"})}>{percentageIcon}Auto-completed ratio</div><div style={gridItemStyle({justifyContent: "flex-end"})}>{formatPercentage(ratios.total)}</div>
        </div>
        <div style={{display: "flex", alignItems: "center", gap: "4px"}}>
          {chevronIcon(showDetailedBreakdown)}
          <a style={detailsCollapseButtonStyle} onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}>Detailed Breakdown</a>
        </div>
        {showDetailedBreakdown && (
          <div style={detailsGridStyle(theme)}>
            <div style={gridItemStyle({marginRight: "16px"})}>{calendarDayIcon}1d</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{eventsCountIcon}{stats.today.count}</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{timeSavedIcon}{formatTimeSaved(stats.today.timeSaved)}</div>
            <div style={gridItemStyle()}>{percentageIcon}{formatPercentage(ratios.today)}</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{calendarWeekIcon}1w</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{eventsCountIcon}{stats.thisWeek.count}</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{timeSavedIcon}{formatTimeSaved(stats.thisWeek.timeSaved)}</div>
            <div style={gridItemStyle()}>{percentageIcon}{formatPercentage(ratios.thisWeek)}</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{calendarMonthIcon}1m</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{eventsCountIcon}{stats.thisMonth.count}</div>
            <div style={gridItemStyle({marginRight: "16px"})}>{timeSavedIcon}{formatTimeSaved(stats.thisMonth.timeSaved)}</div>
            <div style={gridItemStyle()}>{percentageIcon}{formatPercentage(ratios.thisMonth)}</div>
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <div style={titleStyle}>Top Repositories</div>
        <div style={subtitleStyle}>Repositories with the highest auto-completion</div>
        {topRepositories.length > 0 ? (
          <div style={overviewGridStyle()}>
            {topRepositories.map((repo) => (
              <>
                <div style={gridItemStyle()}>
                  {repositoryIcon(topRepositories.indexOf(repo))}
                  {repo.repository}
                </div>
                <div style={gridItemStyle({justifyContent: "flex-end"})}>{repo.count}</div>
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

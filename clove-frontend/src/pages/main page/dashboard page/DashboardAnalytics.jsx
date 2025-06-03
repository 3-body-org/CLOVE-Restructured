import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faTrophy } from "@fortawesome/free-solid-svg-icons";
import styles from "../../../scss modules/pages/main page/dashboard page/DashboardPage.module.scss";
import Dashboard from "./DashboardPage";

const ProgressBarChart = ({ data }) => (
  <div className={styles.barChart}>
    {data.map((item, index) => (
      <div className={styles.barContainer} key={index}>
        <div className={styles.barLabel}>
          <span>{item.topic}</span>
          <span>{item.percentage}%</span>
        </div>
        <div className={styles.bar}>
          <div
            className={styles.barFill}
            style={{ width: `${item.percentage}%` }}
          ></div>
        </div>
      </div>
    ))}
  </div>
);

const DonutChart = ({ percentage, label, description }) => (
  <div className={styles.chartWrapper}>
    <div className={styles.donutChart}>
      <div className={styles.donutCenter}>
        <div className={styles.donutCenterText}>{percentage}%</div>
        <div className={styles.donutCenterLabel}>{label}</div>
      </div>
    </div>
    <div className={styles.chartLabel}>{description}</div>
  </div>
);

export const DashboardAnalytics = ({ progressData, challengesData }) => (
  <>
    <div className={styles.card}>
      <h3>
        <FontAwesomeIcon icon={faChartBar} /> Progress Overview
      </h3>
      <ProgressBarChart data={progressData} />
    </div>

    <div className={styles.card}>
      <h3>
        <FontAwesomeIcon icon={faTrophy} /> Challenges Solved
      </h3>
      <DonutChart
        percentage={challengesData.percentage}
        label={challengesData.label}
        description={challengesData.description}
      />
    </div>
  </>
);

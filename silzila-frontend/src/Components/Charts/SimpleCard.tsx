import ReactEcharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
	ChartControlsProps,
	ChartControlStateProps,
} from "../../redux/ChartPoperties/ChartControlsInterface";
import { ColorSchemes } from "../ChartOptions/Color/ColorScheme";
import { formatChartLabelValue } from "../ChartOptions/Format/NumberFormatter";
import { ChartsReduxStateProps, FormatterValueProps } from "./ChartsCommonInterfaces";

const SimpleCard = ({
	//props
	propKey,
	graphDimension,
	chartArea,
	graphTileSize,

	//state
	chartControls,
}: ChartsReduxStateProps) => {
	var chartControl: ChartControlsProps = chartControls.properties[propKey];
	let chartData: any[] = chartControl.chartData ? chartControl.chartData : [];
	const [cardData, setcardData] = useState<any>();

	useEffect(() => {
		if (chartData.length >= 1) {
			console.log(Object.keys(chartData[0])[0]);
			console.log(chartData[0][Object.keys(chartData[0])[0]]);
			setcardData(chartData[0][Object.keys(chartData[0])[0]]);
		}
	}, [chartData]);
	console.log(cardData);
	var chartThemes: any[] = ColorSchemes.filter(el => {
		return el.name === chartControl.colorScheme;
	});

	const getFormatedChartData = () => {
		var formattedValue = cardData;
		console.log(formattedValue);
		formattedValue = formatChartLabelValue(chartControl, formattedValue);
		return formattedValue;
	};

	// top: chartControl.chartMargin.top + "%",
	// 						bottom: chartControl.chartMargin.bottom + "%",
	// 						left: chartControl.chartMargin.funnelLeft + "%",
	// 						right: chartControl.chartMargin.funnelRight + "%",
	const cardComponent = () => {
		return (
			<div
				className="simpleCardStyle"
				style={{
					height: "300px",
					width: "400px",
					marginLeft: chartControl.chartMargin.left,
					marginRight: chartControl.chartMargin.right,
					marginTop: chartControl.chartMargin.top,
					marginBottom: chartControl.chartMargin.bottom,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignContent: "center",
						height: "100%",
						width: "100%",
					}}
				>
					<span style={{ fontSize: "35px" }}>{getFormatedChartData()}</span>
					<span>{Object.keys(chartData[0])[0]}</span>
				</div>
			</div>
		);
	};
	const RenderChart = () => {
		return (
			<div
				style={{
					padding: "1rem",
					width: graphDimension.width,
					height: graphDimension.height,
					overflow: "hidden",
					margin: "auto",
					border: chartArea
						? "none"
						: graphTileSize
						? "none"
						: "1px solid rgb(238,238,238)",
					backgroundColor: chartThemes[0].background,
					color: chartThemes[0].colors[0],
				}}
			>
				{cardComponent()}
			</div>
		);
	};

	return chartData.length >= 1 ? <RenderChart /> : null;
};
const mapStateToProps = (state: ChartControlStateProps, ownProps: any) => {
	return {
		chartControls: state.chartControls,
	};
};

export default connect(mapStateToProps, null)(SimpleCard);

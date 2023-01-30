// This component represent each individual table field dropped inside dropzone
// Each card has some aggregate values and option to select different aggregate and/or timeGrain values

import React, { useCallback, useState, useEffect } from "react";
import "./Card.css";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { connect } from "react-redux";
import {
	editChartPropItem,
	revertAxes,
	sortAxes,
} from "../../redux/ChartPoperties/ChartPropertiesActions";
import { Divider, Menu, MenuItem } from "@mui/material";
import Aggregators, { AggregatorKeys } from "./Aggregators";
import { useDrag, useDrop } from "react-dnd";
import { Dispatch } from "redux";
import { TabTileStateProps2 } from "../../redux/TabTile/TabTilePropsInterfaces";
import { ChartPropertiesStateProps } from "../../redux/ChartPoperties/ChartPropertiesInterfaces";
import { CardProps } from "./ChartAxesInterfaces";

const Card = ({
	// props
	field,
	bIndex,
	itemIndex,
	propKey,
	axisTitle,

	// state
	tabTileProps,
	chartProp,

	// dispatch
	// chartPropUpdated,
	deleteDropZoneItems,
	updateQueryParam,
	sortAxes,
	revertAxes,
}: CardProps) => {
	field.dataType = field.dataType.toLowerCase();

	const originalIndex = chartProp.properties[propKey].chartAxes[bIndex].fields.findIndex(
		(item: any) => item.uId === field.uId
	);

	const deleteItem = () => {
		deleteDropZoneItems(propKey, bIndex, itemIndex);
		// chartPropUpdated(true);
	};

	const [showOptions, setShowOptions] = useState<boolean>(false);

	const [anchorEl, setAnchorEl] = useState<any | null>(null);

	const open: boolean = Boolean(anchorEl);

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
		console.log(open);
	};

	const handleClose = (closeFrom: any, queryParam?: any) => {
		// console.log(closeFrom);
		setAnchorEl(null);
		setShowOptions(false);

		if (closeFrom === "agg" || closeFrom === "timeGrain") {
			var field2 = JSON.parse(JSON.stringify(field));

			if (closeFrom === "agg") {
				// console.log("Aggregate Choice selected", queryParam);
				field2.agg = queryParam;
			} else if (closeFrom === "timeGrain") {
				// console.log("Time Grain Choice selected", queryParam);
				field2.timeGrain = queryParam;
			}
			// console.log(propKey, bIndex, itemIndex, field2);
			updateQueryParam(propKey, bIndex, itemIndex, field2);
		}
	};

	var menuStyle = { fontSize: "12px", padding: "2px 1rem" };
	var menuSelectedStyle = {
		fontSize: "12px",
		padding: "2px 1rem",
		backgroundColor: "rgba(25, 118, 210, 0.08)",
	};

	// Properties and behaviour when a card is dragged
	const [, drag] = useDrag({
		item: {
			uId: field.uId,
			fieldname: field.fieldname,
			displayname: field.fieldname,
			dataType: field.dataType,
			prefix: field.prefix,
			tableId: field.tableId,
			// type: "card",
			bIndex,
			originalIndex,
		},
		type: "card",

		end: (dropResult, monitor) => {
			// console.log("***************on DRAG END**************");
			const { uId, bIndex, originalIndex } = monitor.getItem();
			// console.log("uId = ", uId);

			const didDrop = monitor.didDrop();
			// console.log("didDrop = ", didDrop);

			if (!didDrop) {
				revertAxes(propKey, bIndex, uId, originalIndex);
			}
		},
	});

	// Properties and behaviours when another card is dropped over this card
	const [, drop] = useDrop({
		accept: "card",
		canDrop: () => false,
		collect: monitor => ({
			backgroundColor1: monitor.isOver({ shallow: true }) ? 1 : 0,
		}),
		hover: ({ uId: dragUId, bIndex: fromBIndex }: { uId: string; bIndex: number }) => {
			if (fromBIndex === bIndex && dragUId !== field.uId) {
				sortAxes(propKey, bIndex, dragUId, field.uId);
				console.log("============HOVER BLOCK END ==============");
			}
		},
	});

	// List of options to show at the end of each card
	// (like, year, month, day, or Count, sum, avg etc)

	const RenderMenu = () => {
		var options: any[] = [];
		var options2: any[] = [];

		if (axisTitle === "Measure" || axisTitle === "X" || axisTitle === "Y") {
			if (field.dataType === "date" || field.dataType === "timestamp") {
				options = options.concat(Aggregators[axisTitle][field.dataType].aggr);
				options2 = options2.concat(Aggregators[axisTitle][field.dataType].timeGrain);
			} else {
				options = options.concat(Aggregators[axisTitle][field.dataType]);
			}
		}

		if (
			axisTitle === "Dimension" ||
			axisTitle === "Row" ||
			axisTitle === "Column" ||
			axisTitle === "Distribution"
		) {
			if (field.dataType === "date" || field.dataType === "timestamp") {
				options2 = options2.concat(Aggregators[axisTitle][field.dataType].timeGrain);
			} else {
				options = options.concat(Aggregators[axisTitle][field.dataType]);
			}
		}
		return (
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={() => handleClose("clickOutside")}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
			>
				{options.length > 0
					? options.map(opt => {
							return (
								<MenuItem
									onClick={() => handleClose("agg", opt.id)}
									sx={opt.id === field.agg ? menuSelectedStyle : menuStyle}
									key={opt.id}
								>
									{opt.name}
								</MenuItem>
							);
					  })
					: null}

				{options.length > 0 && options2.length > 0 ? <Divider /> : null}

				{options2.length > 0
					? options2.map(opt2 => {
							return (
								<MenuItem
									onClick={() => handleClose("timeGrain", opt2.id)}
									sx={opt2.id === field.timeGrain ? menuSelectedStyle : menuStyle}
									key={opt2.id}
								>
									{opt2.name}
								</MenuItem>
							);
					  })
					: null}

				{options.length === 0 && options2.length === 0 ? (
					<MenuItem onClick={handleClose} sx={menuStyle} key="optNa">
						<i>-- No options --</i>
					</MenuItem>
				) : null}
			</Menu>
		);
	};

	return field ? (
		<div
			ref={node => drag(drop(node))}
			className="axisField"
			onMouseOver={() => setShowOptions(true)}
			onMouseLeave={() => {
				if (!open) {
					setShowOptions(false);
				}
			}}
		>
			<button
				type="button"
				className="buttonCommon columnClose"
				onClick={deleteItem}
				title="Remove field"
				style={showOptions ? { visibility: "visible" } : { visibility: "hidden" }}
			>
				<CloseRoundedIcon style={{ fontSize: "13px", margin: "auto" }} />
			</button>

			<span className="columnName ">{field.fieldname}</span>
			<span className="columnPrefix">
				{field.agg ? AggregatorKeys[field.agg] : null}

				{field.timeGrain && field.agg ? <React.Fragment>, </React.Fragment> : null}
				{field.timeGrain ? AggregatorKeys[field.timeGrain] : null}
			</span>
			<span className="columnPrefix"> {field.prefix ? `${field.prefix}` : null}</span>
			<button
				type="button"
				className="buttonCommon columnDown"
				title="Remove field"
				style={showOptions ? { visibility: "visible" } : { visibility: "hidden" }}
				onClick={(e: any) => {
					handleClick(e);
				}}
			>
				<KeyboardArrowDownRoundedIcon style={{ fontSize: "14px", margin: "auto" }} />
			</button>
			<RenderMenu />
		</div>
	) : null;
};

const mapStateToProps = (state: TabTileStateProps2 & ChartPropertiesStateProps) => {
	return {
		tabTileProps: state.tabTileProps,
		chartProp: state.chartProperties,
	};
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
	return {
		deleteDropZoneItems: (propKey: string, binIndex: number, itemIndex: number) =>
			dispatch(editChartPropItem("delete", { propKey, binIndex, itemIndex })),

		updateQueryParam: (propKey: string, binIndex: number, itemIndex: number, item: any) =>
			dispatch(editChartPropItem("updateQuery", { propKey, binIndex, itemIndex, item })),

		sortAxes: (propKey: string, bIndex: number, dragUId: string, uId: string) =>
			dispatch(sortAxes(propKey, bIndex, dragUId, uId)),
		revertAxes: (propKey: string, bIndex: number, uId: string, originalIndex: number) =>
			dispatch(revertAxes(propKey, bIndex, uId, originalIndex)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Card);

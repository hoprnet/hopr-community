import React from 'react';
import PropTypes from 'prop-types';
import GridBlock from './GridBlock';
import './styles/Grid.style.css';
import type { Block } from 'lib/utils'

function renderGrid(grid: any) {
	return grid.map((row: Block[], rowIndex: number) => {
		return (
			<div key={`${rowIndex}`} className="grid__row">
				{row.map((block: Block, blockIndex: number) => 
					<GridBlock key={`${rowIndex}-${blockIndex}`} block={block} />)}
			</div>
		);
	});
}

function Grid({
	rows,
	grid
}: {
	rows: number,
	grid: any
}) {
	// const width = rows * 60 + (rows + 1) * 20;
	return (
		<div className="grid" style={{ width: '260px' }}>
			{renderGrid(grid)}
		</div>
	);
}

Grid.propTypes = {
	state: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

Grid.defaultProps = {
	state: {
		currentPlayer: 0,
		grid: [],
	},
	dispatch: () => {},
};

export default Grid;

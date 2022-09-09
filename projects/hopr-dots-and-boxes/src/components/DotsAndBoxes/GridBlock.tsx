import React from 'react';
import PropTypes from 'prop-types';
import Dot from './Dot';
import Box from './Box';
import Bar from './Bar';
import './styles/GridBlock.style.css';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { doMove, selectCurrentPlayer, selectSide, Side } from 'state/slices/gameSlice/gameSlice';
import type { Block } from 'lib/utils'
import { sendMove } from 'state/slices/peerSlice/peerSlice';

function GridBlock({
	text = '',
	block
}: {
	text?: string,
	block: Block
}) {
	const dispatch = useAppDispatch()

	const currentPlayer = useAppSelector(selectCurrentPlayer)
	const side = useAppSelector(selectSide)

	function handleBarClick(row: number, column: number, type: string) {
		if ((side === Side.First && currentPlayer === 1)
			|| (side === Side.Second && currentPlayer === 2)) {
			dispatch(doMove({ row, column, type }));
			dispatch(sendMove({ row, column, type }));
		}
	}

	const { row, column, top, left, completedBy } = block;
	return (
		<div className="grid__basic-block">
			<div className="grid__basic-block__dot-and-bar">
				<Dot />
				<Bar
					type={top}
					orientation="horizontal"
					onBarClick={() => handleBarClick(row, column, 'top')}
				/>
			</div>
			<div className="grid__basic-block__bar-and-box">
				<Bar
					type={left}
					orientation="vertical"
					onBarClick={() => handleBarClick(row, column, 'left')}
				/>
				<Box type={completedBy} text={text} />
			</div>
		</div>
	);
}

GridBlock.propTypes = {
	block: PropTypes.object.isRequired,
	dispatch: PropTypes.func.isRequired,
};

GridBlock.defaultProps = {
	block: {},
	dispatch: () => {},
};

export default GridBlock;

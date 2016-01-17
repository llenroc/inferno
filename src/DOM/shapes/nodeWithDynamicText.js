import isVoid from '../../util/isVoid';
import isStringOrNumber from '../../util/isStringOrNumber';
import { getValueWithIndex } from '../../core/variables';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';

const errorMsg = 'Inferno Error: Template nodes with TEXT must only have a StringLiteral or NumericLiteral as a value, this is intended for low-level optimisation purposes.';

export default function createNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create(item, treeLifecycle) {
			const domNode = templateNode.cloneNode(false);
			const value = getValueWithIndex(item, valueIndex);

			if (!isVoid(value)) {
				if (process.env.NODE_ENV !== 'production') {
					if (!isStringOrNumber(value)) {
						throw Error(errorMsg);
					}
				}
				if (value === '') {
					domNode.appendChild(document.createTextNode(''));
				} else {
					domNode.textContent = value;
				}
			}
			if (dynamicAttrs) {
				addDOMDynamicAttributes(item, domNode, dynamicAttrs, node, 'onCreated');
			}
			if (dynamicAttrs && dynamicAttrs.onAttached) {
				treeLifecycle.addTreeSuccessListener(() => {
					handleHooks(item, dynamicAttrs, domNode, 'onAttached');
				});
			}
			domNodeMap[item.id] = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			const domNode = domNodeMap[lastItem.id];
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
			}
			if (nextValue !== lastValue) {
				if (isVoid(nextValue)) {
					if (isVoid(lastValue)) {
						domNode.firstChild.nodeValue = '';
					} else {
						domNode.textContent = '';
					}
				} else {
					if (process.env.NODE_ENV !== 'production') {
						if (!isStringOrNumber(nextValue)) {
							throw Error(errorMsg);
						}
					}
					if (isVoid(lastValue)) {
						domNode.textContent = nextValue;
					} else {
						domNode.firstChild.nodeValue = nextValue;
					}
				}
			}
			if (dynamicAttrs) {
				updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs);
			}
			if (dynamicAttrs && dynamicAttrs.onDidUpdate) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onDidUpdate');
			}
		},
		remove(item) {
			const domNode = domNodeMap[item.id];

			if (dynamicAttrs) {

				if (dynamicAttrs.onDetached) {
					handleHooks(item, dynamicAttrs, domNode, 'onDetached');
				}
				clearListeners(item, domNode, dynamicAttrs);
			}
		}
	};

	return node;
}

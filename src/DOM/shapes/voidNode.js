import { addDOMDynamicAttributes, updateDOMDynamicAttributes, clearListeners, handleHooks } from '../addAttributes';

export default function createVoidNode(templateNode, dynamicAttrs) {
	const domNodeMap = {};
	const node = {
		overrideItem: null,
		create(item, treeLifecycle) {
			const domNode = templateNode.cloneNode(true);

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

			if (dynamicAttrs && dynamicAttrs.onWillUpdate) {
				handleHooks(nextItem, dynamicAttrs, domNode, 'onWillUpdate');
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

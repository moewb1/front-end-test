class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  addNode(value) {
    const node = new ListNode(value);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
      return;
    }

    this.tail.next = node;
    this.tail = node;
  }

  removeNodes(x) {
    this.head = removeGreaterThan(this.head, x);

    let current = this.head;
    this.tail = null;

    while (current !== null) {
      this.tail = current;
      current = current.next;
    }

    return this.head;
  }

  toArray() {
    const values = [];
    let current = this.head;

    while (current !== null) {
      values.push(current.value);
      current = current.next;
    }

    return values;
  }
}

function removeGreaterThan(head, x) {
  while (head !== null && head.value > x) {
    head = head.next;
  }

  let current = head;

  while (current !== null && current.next !== null) {
    if (current.next.value > x) {
      current.next = current.next.next;
    } else {
      current = current.next;
    }
  }

  return head;
}

function buildLinkedList(values) {
  const list = new LinkedList();
  for (let i = 0; i < values.length; i++) {
    list.addNode(values[i]);
  }
  return list;
}

if (require.main === module) {
  const values = [10, 5, 12, 7, 3, 9, 10];
  const x = 7;

  const list = buildLinkedList(values);
  list.removeNodes(x);
  console.log(list.toArray().join(" "));
}

module.exports = {
  ListNode,
  LinkedList,
  removeGreaterThan
};

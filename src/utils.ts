/* eslint-disable @typescript-eslint/no-explicit-any */

import { debug, error } from '@nephelaiio/logger';

type ValueCondition = (x: any) => boolean;
type ValueFunction = (x: any) => any;

const constFn =
  (value: any): ValueFunction =>
  () =>
    value;

class Value {
  _value: any;
  constructor(value: any) {
    this._value = value;
  }
  value() {
    return this._value;
  }
  ifThen(cfn: ValueCondition, vfn: ValueFunction): Value {
    return cfn(this._value) ? new Value(vfn(this._value)) : this;
  }
}

function withValue(value: any = undefined): Value {
  return new Value(value);
}

async function attempt(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e: any) {
    error('Aborting on unrecoverable error');
    debug(e.message);
    process.exit(1);
  }
}

export { attempt, withValue, constFn };

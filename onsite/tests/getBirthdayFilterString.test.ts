import { getBirthdayFilterString } from "@/composables/fields/birthday/getBirthdayFilterString";
import { expect, test } from "vitest";

function testBirthday(value: string, parsed: string): void {
  test(`Birthday ${value}`, () => {
    expect(getBirthdayFilterString(value)).toBe(parsed);
  });
}

testBirthday("2yyy-mm-dd", "2");
testBirthday("22yy-01-01", "22");
testBirthday("197y-mm-dd", "197");

testBirthday("2000", "2000");
testBirthday("2000-", "2000-");
testBirthday("2000-1", "2000-1");
testBirthday("2000-1-", "2000-1-");
testBirthday("2000-1-0", "2000-1-");
testBirthday("2000-1-1", "2000-1-1");
testBirthday("2000-1-1-", "2000-1-1-");

testBirthday("2000", "2000");
testBirthday("2000-", "2000-");
testBirthday("2000-0", "2000-");
testBirthday("2000-01", "2000-1-");
testBirthday("2000-01-", "2000-1-");
testBirthday("2000-01-0", "2000-1-");
testBirthday("2000-01-1", "2000-1-1");
testBirthday("2000-01-1-", "2000-1-1-");
testBirthday("2000-01-01", "2000-1-1-");
testBirthday("2000-01-01-", "2000-1-1-");

testBirthday("2005-9", "2005-9");
testBirthday("2005-09", "2005-9-");

testBirthday("2000-1-dd", "2000-1");
testBirthday("2000-01-dd", "2000-1-");

testBirthday("2000-mm-dd", "2000");
testBirthday("2000-1m-dd", "2000-1");
testBirthday("2000-0m-dd", "2000");
testBirthday("2000-m1-dd", "2000");
testBirthday("2000-m0-dd", "2000");

testBirthday("2000-mm-01", "2000");
testBirthday("2000-1m-01", "2000-1");
testBirthday("2000-0m-01", "2000");
testBirthday("2000-m1-01", "2000");
testBirthday("2000-m0-01", "2000");

testBirthday("2000-01-01", "2000-1-1-");
testBirthday("2000-01-1", "2000-1-1");
testBirthday("2000-1-01", "2000-1-1-");
testBirthday("2000-1-1", "2000-1-1");

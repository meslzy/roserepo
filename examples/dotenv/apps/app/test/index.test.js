const { name } = require("../dist/index");

test("name", () => {
  expect(name).toBe("app depends on (app1 depends on (lib1 depends on (package1))) and (app2 depends on (lib2 depends on (package2)))");
});
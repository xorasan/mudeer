# CHANGELOG
This is an incomplete progress list of features & known bugs.  

## 2024 08
* `build` now imports modules into `src/imported`
	* the old method was to symlink them into `src/linked` and `+include` them using Weld later
	* the new method is more costly but it ensures you always have the latest files
	* it only takes `conf.include` into account and ignores `conf.src`
	* so including `list` or `list.recycle` would auto-import any related files
<?php
/**
 * The main control class.
 *
 * @package Xinc
 * @author David Ellis
 * @author Gavin Foster
 * @version 1.0
 * @copyright 2007 David Ellis, One Degree Square
 * @license  http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see license.php
 *	This file is part of Xinc.
 *	Xinc is free software; you can redistribute it and/or modify
 *	it under the terms of the GNU Lesser General Public License as published by
 *	the Free Software Foundation; either version 2.1 of the License, or
 *	(at your option) any later version.
 *
 *	Xinc is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Lesser General Public License for more details.
 *
 *	You should have received a copy of the GNU Lesser General Public License
 *	along with Xinc, write to the Free Software
 *	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */
require_once 'Xinc/Logger.php';
require_once 'Xinc/Parser.php';
require_once 'Xinc/ModificationSet/Interface.php';
require_once 'Xinc/Builder/Interface.php';
require_once 'Xinc/Exception/MalformedConfig.php';
require_once 'Xinc/Plugin/Parser.php';

class Xinc
{
	/**
	 * The projects that Xinc is going build.
	 *
	 * @var Project[]
	 */
	private $projects;



	/**
	 * The parser.
	 *
	 * @var Parser
	 */
	private $parser;

	/**
	 * The directory to drop xml status files
	 * @var string
	 */
	private $statusDir;

	/**
	 * Constructor.
	 */
	function __construct() {
		$this->projects = array();
		$this->parser = new Xinc_Parser();
		$this->pluginParser = new Xinc_Plugin_Parser();
	}

	/**
	 * Specify a config file to be parsed for project definitions.
	 *
	 * @param string $fileName
	 * @throws Xinc_Exception_MalformedConfig
	 */
	function setConfigFile($fileName)
	{
		try {
			$this->projects = $this->parser->parse($fileName);
		} catch(Exception $e) {
			throw new Xinc_Exception_MalformedConfig();
		}
	}
	function setPluginConfigFile($fileName)
	{
		try {
			$this->pluginParser->parse($fileName);
		} catch(Exception $e) {
			Xinc_Logger::getInstance()->error("error parsing plugin-tasks:".$e->getMessage());
				
		}
	}
	/**
	 * Specify multiple config files to be parsed for project definitions.
	 *
	 * @param string[] $fileNames
	 */
	function setConfigFiles($fileNames)
	{
		foreach ($fileNames as $fileName) {
			$this->setConfigFile($fileName);
		}
	}

	/**
	 * Set the directory in which to save project status files
	 *
	 * @param string $statusDir
	 */
	function setStatusDir($statusDir)
	{
		$this->statusDir = $statusDir;
	}

	/**
	 * Set the projects to build.
	 *
	 * @param Project[] $projects
	 */
	function setProjects($projects)
	{
		$this->projects = $projects;
	}

	/**
	 * Adds the passed in project
	 *
	 * @param Project $project
	 */
	function addProject($project)
	{
		$this->projects[] = $project;
	}

	/**
	 * Gets the projects being built
	 *
	 * @return Project[] $projects
	 */
	function getProjects()
	{
		return $this->projects;
	}


	/**
	 * processes a single project
	 * @param Project $project
	 */
	function processProject(Xinc_Project $project)
	{
		if (time() < $project->getSchedule()) return;

		Xinc_Logger::getInstance()->info("CHECKING PROJECT " . $project->getName());

		$project->process(Xinc_Plugin_Slot::PRE_PROCESS);
		if ( Xinc_Project_Status::PASSED != $project->getStatus() ) {
			Xinc_Logger::getInstance()->info("Code up to date, no steps necessary");
			$project->reschedule();
			$project->serialize($this->statusDir);
			return;
		}
			

		Xinc_Logger::getInstance()->info("Code not up to date, building project");
		$project->process(Xinc_Plugin_Slot::PROCESS);
		if ( Xinc_Project_Status::PASSED == $project->getStatus() ) {
			Xinc_Logger::getInstance()->info("BUILD PASSED FOR PROJECT " . $project->getName());
		}else if ( Xinc_Project_Status::STOPPED == $project->getStatus() ) {
			Xinc_Logger::getInstance()->warn("BUILD STOPPED FOR PROJECT " . $project->getName());
		}
		else {
			Xinc_Logger::getInstance()->warn("BUILD FAILED FOR PROJECT " . $project->getName());
		}

		if ( $project->getStatus() == Xinc_Project_Status::PASSED ){
			$project->process(Xinc_Plugin_Slot::POST_PROCESS);
		}
		//$project->publish();
		$project->reschedule();
		$project->serialize($this->statusDir);
	}

	/**

	/**
	* Processes the projects that have been configured in the config-file and executes each project
	* if the scheduled time has expired
	*
	*/
	function processProjects(){
		foreach ($this->projects as $project ) {
			$this->processProject($project);
		}
	}

	/**
	 * Starts the continuous loop.
	 */
	function start()
	{
		/** figure out minimum time to wait between checking projects */
		$minWait = -1;
		foreach ($this->projects as $project) {
			if ($minWait == -1 || $project->getInterval() < $minWait) {
				$minWait = $project->getInterval();
			}
		}

		if ($minWait > 0) {
			while(true) {
				Xinc_Logger::getInstance()->info('Sleeping for ' . $minWait . ' seconds');
				Xinc_Logger::getInstance()->flush();
				sleep((float) $minWait);
				$this->processProjects();
			}
		} else {
			Xinc_Logger::getInstance()->info('Run-once mode (project interval is negative)');
			Xinc_Logger::getInstance()->flush();
			$this->processProjects();
		}
	}

	/**
	 * Static main function called by bin script
	 */
	public static function main($configFile, $pluginConfigFile, $logFile, $statusDir)
	{
		$logger = Xinc_Logger::getInstance();
		$logger->setLogFile($logFile);

		$xinc = new Xinc();
		$xinc->setPluginConfigFile($pluginConfigFile);
		$xinc->setConfigFile($configFile);

		$xinc->setStatusDir($statusDir);
		$xinc->start();
	}
}

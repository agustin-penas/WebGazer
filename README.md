# webgazer

This repository is a fork of the [webgazer
project](https://webgazer.cs.brown.edu) modified to handle the needs of
[rastoc](https://github.com/ffigari/rastreador-ocular).
The only component being reused is the gaze estimation model.
There is no guarantee that other components (like the examples files or
secondary estimation models) are still working.
Modifications to this repo should be done in the context of rastoc.
Check that repo for more details.

The `develop` branch is the one in which changes are being made.
Instead, the `master` branch points to the last common ancestor with the
upstream repo.

# Original authors

WebGazer was originally developed at Brown University.
Below is the last section of its original README.md in which acknowledgements
to its original authors are made.

## Publications

  _**Note:** The current iteration of WebGazer no longer corresponds with the WebGazer described in the following publications and which can be found [here](https://github.com/brownhci/WebGazer/tree/2a4a70cb49b2d568a09362e1b52fd3bd025cd38d)._

	@inproceedings{papoutsaki2016webgazer,
	author     = {Alexandra Papoutsaki and Patsorn Sangkloy and James Laskey and Nediyana Daskalova and Jeff Huang and James Hays},
	title      = {{WebGazer}: Scalable Webcam Eye Tracking Using User Interactions},
    booktitle  = {Proceedings of the 25th International Joint Conference on Artificial Intelligence (IJCAI-16)},
    pages      = {3839--3845},
	year       = {2016},
	organization={AAAI}
	}

	@inproceedings{papoutsaki2017searchgazer,
	author     = {Alexandra Papoutsaki and James Laskey and Jeff Huang},
    title      = {SearchGazer: Webcam Eye Tracking for Remote Studies of Web Search},
    booktitle  = {Proceedings of the ACM SIGIR Conference on Human Information Interaction \& Retrieval (CHIIR)},
    year       = {2017},
    organization={ACM}
    }

    @inproceedings{papoutsaki2018eye,
    author={Papoutsaki, Alexandra and Gokaslan, Aaron and Tompkin, James and He, Yuze and Huang, Jeff},
    title={The eye of the typer: a benchmark and analysis of gaze behavior during typing.},
    booktitle={Proceedings of the 2018 ACM Symposium on Eye Tracking Research \& Applications (ETRA)},
    pages={16--1},
    year={2018},
    organization={ACM}
    }



## Who We Are

  * Alexandra Papoutsaki
  * Aaron Gokaslan
  * Ida De Smet
  * Xander Koo
  * James Tompkin
  * Jeff Huang

## Other Collaborators

  * Nediyana Daskalova
  * James Hays
  * Yuze He
  * James Laskey
  * Patsorn Sangkloy
  * Elizabeth Stevenson
  * Preston Tunnell Wilson
  * Jack Wong

### Acknowledgements

Webgazer is developed based on the research that is done by Brown University, with recent work at Pomona College. The work of the calibration example file was developed in the context of a course project with the aim to improve the feedback of WebGazer. It was proposed by Dr. Gerald Weber and his team Dr. Clemens Zeidler and Kai-Cheung Leung.

This research is supported by NSF grants IIS-1464061, IIS-1552663, and the Brown University Salomon Award.

## License

Copyright (C) 2020 [Brown HCI Group](http://hci.cs.brown.edu)

Licensed under GPLv3. Companies have the option to license WebGazer.js under LGPLv3 while their valuation is under $1,000,000.
